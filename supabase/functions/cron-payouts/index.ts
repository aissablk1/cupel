// =============================================================================
// Forgekit — Edge Function: cron-payouts
// Author: Aïssa BELKOUSSA
// Runtime: Deno (Supabase Edge Functions)
// Description: Cron mensuel — calcule les payouts du mois précédent pour
//              chaque créateur éligible (revenu net ≥ seuil) et stub Stripe
//              transfer. Idempotent : la fonction SQL claim_pending_payouts
//              utilise UNIQUE(creator_id, period_start, period_end).
// =============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/supabase.ts';

const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
const MIN_PAYOUT_CENTS = parseInt(Deno.env.get('MIN_PAYOUT_CENTS') ?? '5000', 10); // 50€
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

interface CronPayload {
  period_start?: string; // YYYY-MM-DD
  period_end?: string;   // YYYY-MM-DD
  dry_run?: boolean;
}

function previousMonthRange(today: Date): { start: string; end: string } {
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth(); // 0-11
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0)); // dernier jour du mois précédent
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

async function stubStripeTransfer(
  amountCents: number,
  currency: string,
  stripeAccountId: string,
  payoutId: string,
): Promise<{ id: string; status: 'paid' | 'processing' | 'failed'; error?: string }> {
  // Stub : phase 1 du projet. Phase 2 = appel réel /v1/transfers Stripe Connect.
  if (!STRIPE_SECRET_KEY) {
    return { id: `stub_${payoutId}`, status: 'processing' };
  }
  if (!stripeAccountId) {
    return { id: '', status: 'failed', error: 'creator has no stripe_account_id' };
  }
  // TODO phase 2 : appel réel Stripe avec idempotency-key = payoutId
  return { id: `stub_${payoutId}`, status: 'processing' };
}

serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // Auth : header `x-cron-secret` ou Authorization Bearer
  const provided =
    req.headers.get('x-cron-secret') ??
    (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!CRON_SECRET || provided !== CRON_SECRET) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let payload: CronPayload = {};
  if (req.headers.get('content-length') && req.headers.get('content-length') !== '0') {
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
  }

  const range = payload.period_start && payload.period_end
    ? { start: payload.period_start, end: payload.period_end }
    : previousMonthRange(new Date());

  const dryRun = payload.dry_run === true;
  const supa = serviceClient();

  // Liste des créateurs ayant au moins une purchase éligible sur la fenêtre
  const { data: candidates, error: cErr } = await supa.rpc('search_skills', {
    p_query: '',
    p_lang: 'simple',
    p_limit: 1,
  }); // smoke-test RPC accessible
  // (On utilise un select direct ci-dessous, plus fiable.)
  if (cErr && cErr.code !== 'PGRST116') {
    // pas bloquant
  }
  void candidates;

  const { data: creators, error: creatorsErr } = await supa
    .from('purchases')
    .select('skill_id, skills!inner(creator_id), profiles:skills!inner(creator_id)')
    .eq('status', 'completed')
    .is('creator_paid_at', null)
    .gte('created_at', `${range.start}T00:00:00Z`)
    .lte('created_at', `${range.end}T23:59:59Z`);

  if (creatorsErr) return jsonResponse({ error: creatorsErr.message }, 500);

  // Déduplication créateurs
  const creatorIds = Array.from(
    new Set(
      (creators ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => row.skills?.creator_id)
        .filter(Boolean),
    ),
  ) as string[];

  const results: Array<{
    creator_id: string;
    payout_id: string | null;
    status: string;
    note?: string;
  }> = [];

  for (const creatorId of creatorIds) {
    if (dryRun) {
      results.push({ creator_id: creatorId, payout_id: null, status: 'dry_run' });
      continue;
    }

    // Création (ou réutilisation) du payout
    const { data: payoutId, error: claimErr } = await supa.rpc('claim_pending_payouts', {
      p_creator_id: creatorId,
      p_period_start: range.start,
      p_period_end: range.end,
    });

    if (claimErr) {
      results.push({
        creator_id: creatorId,
        payout_id: null,
        status: 'claim_failed',
        note: claimErr.message,
      });
      continue;
    }
    if (!payoutId) {
      results.push({ creator_id: creatorId, payout_id: null, status: 'no_amount' });
      continue;
    }

    // Lecture du payout pour décider du transfer
    const { data: payout } = await supa
      .from('payouts')
      .select('id, total_cents, currency, creator_id')
      .eq('id', payoutId)
      .single();

    if (!payout) {
      results.push({ creator_id: creatorId, payout_id: payoutId, status: 'missing' });
      continue;
    }

    if (payout.total_cents < MIN_PAYOUT_CENTS) {
      results.push({
        creator_id: creatorId,
        payout_id: payout.id,
        status: 'below_threshold',
      });
      continue;
    }

    const { data: profile } = await supa
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', creatorId)
      .single();

    const transfer = await stubStripeTransfer(
      payout.total_cents,
      payout.currency,
      profile?.stripe_account_id ?? '',
      payout.id,
    );

    await supa
      .from('payouts')
      .update({
        status: transfer.status === 'paid' ? 'paid'
              : transfer.status === 'failed' ? 'failed'
              : 'processing',
        stripe_transfer_id: transfer.id || null,
        paid_at: transfer.status === 'paid' ? new Date().toISOString() : null,
        failure_reason: transfer.error ?? null,
      })
      .eq('id', payout.id);

    results.push({
      creator_id: creatorId,
      payout_id: payout.id,
      status: transfer.status,
      note: transfer.error,
    });
  }

  return jsonResponse({
    ok: true,
    period: range,
    dry_run: dryRun,
    processed: results.length,
    results,
  });
});
