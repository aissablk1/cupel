// =============================================================================
// Cupel — Edge Function: lemonsqueezy-webhook
// Author: Aïssa BELKOUSSA
// Runtime: Deno (Supabase Edge Functions)
// =============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { encodeHex } from 'https://deno.land/std@0.224.0/encoding/hex.ts';

const WEBHOOK_SECRET = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PLATFORM_SHARE = 0.25;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

async function verifySignature(rawBody: string, signature: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const expected = encodeHex(new Uint8Array(mac));
  // timing-safe compare
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

interface LSEvent {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string; skill_id?: string; variant_id?: string };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

async function handleOrderCreated(evt: LSEvent) {
  const attrs = evt.data.attributes as {
    total: number;
    tax: number;
    currency: string;
    status: string;
    first_order_item: { product_id: number; variant_id: number };
  };
  const userId = evt.meta.custom_data?.user_id;
  const skillId = evt.meta.custom_data?.skill_id;
  if (!userId || !skillId) {
    console.error('order_created without custom_data', evt.data.id);
    return;
  }

  const amount = attrs.total;
  const vat = attrs.tax;
  const netCents = amount - vat;
  const platformShare = Math.round(netCents * PLATFORM_SHARE);
  const creatorShare = netCents - platformShare;

  const { error } = await supabase.from('purchases').insert({
    user_id: userId,
    skill_id: skillId,
    amount_cents: amount,
    vat_cents: vat,
    currency: attrs.currency,
    ls_order_id: evt.data.id,
    status: 'completed',
    creator_share_cents: creatorShare,
    platform_share_cents: platformShare,
  });
  if (error) throw error;

  await supabase.rpc('increment_skill_revenue', {
    p_skill_id: skillId,
    p_amount_cents: netCents,
  }).then(() => {}).catch(() => {});
}

async function handleOrderRefunded(evt: LSEvent) {
  const { error } = await supabase
    .from('purchases')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    })
    .eq('ls_order_id', evt.data.id);
  if (error) throw error;
}

async function handleSubscriptionUpsert(evt: LSEvent) {
  const attrs = evt.data.attributes as {
    status: string;
    renews_at: string | null;
    ends_at: string | null;
  };
  const userId = evt.meta.custom_data?.user_id;
  const skillId = evt.meta.custom_data?.skill_id;
  if (!userId || !skillId) return;

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      skill_id: skillId,
      ls_subscription_id: evt.data.id,
      status: attrs.status,
      current_period_end: attrs.renews_at,
      cancelled_at: attrs.ends_at,
    },
    { onConflict: 'ls_subscription_id' },
  );
  if (error) throw error;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('x-signature');
  if (!signature) return new Response('Missing signature', { status: 401 });

  const rawBody = await req.text();
  const valid = await verifySignature(rawBody, signature);
  if (!valid) return new Response('Invalid signature', { status: 401 });

  let evt: LSEvent;
  try {
    evt = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  try {
    switch (evt.meta.event_name) {
      case 'order_created':
        await handleOrderCreated(evt);
        break;
      case 'order_refunded':
        await handleOrderRefunded(evt);
        break;
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled':
      case 'subscription_resumed':
      case 'subscription_expired':
        await handleSubscriptionUpsert(evt);
        break;
      default:
        console.log('Unhandled event', evt.meta.event_name);
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook handler error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
