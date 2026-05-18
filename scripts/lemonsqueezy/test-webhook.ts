/**
 * Cupel — scripts/lemonsqueezy/test-webhook.ts
 * Author: Aïssa BELKOUSSA
 * Created: 2026-05-14
 *
 * Forge un payload LS signé HMAC-SHA256 et l'envoie au webhook local
 * (Supabase Edge Function `lemonsqueezy-webhook`).
 *
 * Usage:
 *   pnpm tsx scripts/lemonsqueezy/test-webhook.ts order_created
 *   pnpm tsx scripts/lemonsqueezy/test-webhook.ts order_refunded
 *   pnpm tsx scripts/lemonsqueezy/test-webhook.ts subscription_created
 *
 * Env requis :
 *   LEMONSQUEEZY_WEBHOOK_SECRET
 *   WEBHOOK_URL (def: http://localhost:54321/functions/v1/lemonsqueezy-webhook)
 *   TEST_USER_ID, TEST_SKILL_ID (UUIDs en base locale)
 */

import { createHmac, randomUUID } from 'node:crypto';

const EVENT = process.argv[2] ?? 'order_created';
const SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const URL = process.env.WEBHOOK_URL ?? 'http://localhost:54321/functions/v1/lemonsqueezy-webhook';
const USER_ID = process.env.TEST_USER_ID ?? '00000000-0000-0000-0000-000000000001';
const SKILL_ID = process.env.TEST_SKILL_ID ?? '00000000-0000-0000-0000-000000000002';

if (!SECRET) {
  console.error('LEMONSQUEEZY_WEBHOOK_SECRET manquant');
  process.exit(1);
}

const orderPayload = (refunded = false): unknown => ({
  meta: {
    event_name: refunded ? 'order_refunded' : 'order_created',
    custom_data: { user_id: USER_ID, skill_id: SKILL_ID },
  },
  data: {
    type: 'orders',
    id: String(Math.floor(Math.random() * 1_000_000)),
    attributes: {
      identifier: randomUUID(),
      user_email: 'buyer@example.com',
      total: 2900,
      tax: 580,
      status: refunded ? 'refunded' : 'paid',
      created_at: new Date().toISOString(),
      first_order_item: { variant_id: 1, product_id: 1 },
    },
  },
});

const subscriptionPayload = (): unknown => ({
  meta: {
    event_name: 'subscription_created',
    custom_data: { user_id: USER_ID, skill_id: SKILL_ID },
  },
  data: {
    type: 'subscriptions',
    id: String(Math.floor(Math.random() * 1_000_000)),
    attributes: {
      status: 'active',
      renews_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      created_at: new Date().toISOString(),
    },
  },
});

const payload =
  EVENT === 'subscription_created'
    ? subscriptionPayload()
    : orderPayload(EVENT === 'order_refunded');

const body = JSON.stringify(payload);
const signature = createHmac('sha256', SECRET).update(body).digest('hex');

console.log(`[test-webhook] POST ${URL}  event=${EVENT}`);

const res = await fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Event-Name': EVENT,
    'X-Signature': signature,
  },
  body,
});

console.log(`[test-webhook] ${res.status} ${res.statusText}`);
console.log(await res.text());
process.exit(res.ok ? 0 : 1);
