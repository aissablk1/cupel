/**
 * ARCHIVED 2026-05-15 — Pivot v0 marketplace payant → annuaire gratuit + B2B Teams.
 * Sync orders one-shot LS obsolète. Voir docs/archive/README.md.
 *
 * Cupel — scripts/lemonsqueezy/sync-orders.ts
 * Author: Aïssa BELKOUSSA
 * Created: 2026-05-14
 *
 * Réconciliation : récupère les orders LS des N derniers jours et vérifie
 * que chaque order existe en base `purchases`. Insère les manquants
 * (en cas de webhook perdu).
 *
 * Usage:
 *   pnpm tsx scripts/lemonsqueezy/sync-orders.ts                # 7 derniers jours
 *   pnpm tsx scripts/lemonsqueezy/sync-orders.ts --days 30      # custom range
 *   pnpm tsx scripts/lemonsqueezy/sync-orders.ts --apply        # applique inserts
 *
 * Env requis : LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID,
 *              SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const LS_API = 'https://api.lemonsqueezy.com/v1';
const APPLY = process.argv.includes('--apply');
const DAYS = Number(
  (process.argv.find((a) => a.startsWith('--days='))?.split('=')[1]) ??
    (process.argv[process.argv.indexOf('--days') + 1] ?? 7),
);

type LSOrder = {
  id: string;
  attributes: {
    identifier: string;
    user_email: string;
    total: number;
    tax: number;
    status: string;
    created_at: string;
    first_order_item: { variant_id: number; product_id: number };
    custom_data?: { user_id?: string; skill_id?: string };
  };
};

const env = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`Env ${k} manquant`);
  return v;
};

async function fetchOrders(sinceISO: string): Promise<LSOrder[]> {
  const orders: LSOrder[] = [];
  let url: string | null =
    `${LS_API}/orders?filter[store_id]=${env('LEMONSQUEEZY_STORE_ID')}&filter[created_at][gte]=${encodeURIComponent(sinceISO)}&page[size]=100`;
  while (url) {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${env('LEMONSQUEEZY_API_KEY')}`,
      },
    });
    if (!res.ok) throw new Error(`LS orders -> ${res.status}`);
    const json = (await res.json()) as { data: LSOrder[]; links?: { next?: string } };
    orders.push(...json.data);
    url = json.links?.next ?? null;
  }
  return orders;
}

async function main(): Promise<void> {
  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
  console.log(`[sync-orders] depuis ${since} (apply=${APPLY})`);

  const orders = await fetchOrders(since);
  console.log(`[sync-orders] ${orders.length} orders LS récupérés`);

  const { data: existing, error } = await supabase
    .from('purchases')
    .select('ls_order_id')
    .gte('created_at', since);
  if (error) throw error;
  const known = new Set(existing.map((p) => p.ls_order_id));

  const missing = orders.filter((o) => !known.has(o.id));
  console.log(`[sync-orders] ${missing.length} orders manquants en base`);

  for (const o of missing) {
    const skillId = o.attributes.custom_data?.skill_id;
    const userId = o.attributes.custom_data?.user_id;
    if (!skillId || !userId) {
      console.warn(`  skip ${o.id} : custom_data incomplet`);
      continue;
    }
    const net = o.attributes.total - o.attributes.tax;
    const platform = Math.round(net * 0.25);
    const creator = net - platform;
    const row = {
      user_id: userId,
      skill_id: skillId,
      ls_order_id: o.id,
      ls_identifier: o.attributes.identifier,
      gross_cents: o.attributes.total,
      vat_cents: o.attributes.tax,
      net_cents: net,
      platform_cents: platform,
      creator_cents: creator,
      status: o.attributes.status === 'refunded' ? 'refunded' : 'completed',
      created_at: o.attributes.created_at,
    };
    console.log(`  insert ${o.id} (${o.attributes.identifier})`);
    if (APPLY) {
      const { error: insErr } = await supabase.from('purchases').upsert(row, {
        onConflict: 'user_id,skill_id,ls_order_id',
      });
      if (insErr) console.error(`    ! ${insErr.message}`);
    }
  }

  console.log(`[sync-orders] done.${APPLY ? '' : ' (dry-run)'}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
