// ARCHIVED 2026-05-15 — Pivot v0 marketplace payant → annuaire gratuit + B2B Teams.
// Wrapper checkout one-shot LS obsolète. Webhook LS conservé en place pour Teams.
// Voir docs/archive/README.md.
//
// Forgekit SDK — Lemon Squeezy wrapper
// Author: Aïssa BELKOUSSA

import {
  lemonSqueezySetup,
  createCheckout,
  getOrder,
  listOrders,
  listSubscriptions,
  getSubscription,
  cancelSubscription,
} from '@lemonsqueezy/lemonsqueezy.js';

export interface LSConfig {
  apiKey: string;
  storeId: string;
}

export function initLemonSqueezy(config: LSConfig): void {
  lemonSqueezySetup({ apiKey: config.apiKey });
}

export interface CreateCheckoutOptions {
  storeId: string;
  variantId: string;
  userId: string;
  skillId: string;
  email?: string;
  redirectUrl?: string;
}

export async function createSkillCheckout(opts: CreateCheckoutOptions) {
  const res = await createCheckout(opts.storeId, opts.variantId, {
    checkoutOptions: { embed: false, dark: false },
    checkoutData: {
      email: opts.email,
      custom: { user_id: opts.userId, skill_id: opts.skillId },
    },
    productOptions: { redirectUrl: opts.redirectUrl },
  });
  return res.data?.data.attributes.url;
}

export { getOrder, listOrders, listSubscriptions, getSubscription, cancelSubscription };
