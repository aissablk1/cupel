// Forgekit SDK — public exports
// Author: Aïssa BELKOUSSA

// NOTE 2026-05-15 — Pivot v0 marketplace payant → annuaire gratuit + B2B Teams.
// `payments/lemonsqueezy.ts` (checkout one-shot) et `payments/stripe-connect.ts`
// archivés dans `docs/archive/v0-marketplace-payant/`. Webhook LS conservé.
export * from './payments/lemonsqueezy-webhook.js';
export { splitRevenue, computeVAT } from '@forgekit/shared';
