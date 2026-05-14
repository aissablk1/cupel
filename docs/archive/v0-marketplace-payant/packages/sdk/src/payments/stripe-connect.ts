// ARCHIVED 2026-05-15 — Pivot v0 marketplace payant → annuaire gratuit + B2B Teams.
// Stripe Connect (payouts créateurs) remplacé par Stripe Billing standard pour Teams.
// Voir docs/archive/README.md.
//
// Forgekit SDK — Stripe Connect (payouts créateurs)
// Author: Aïssa BELKOUSSA
// Phase 2 — payouts mensuels aux créateurs via Stripe Connect Express

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-09-30.acacia' });
  }
  return _stripe;
}

export async function createConnectedAccount(opts: {
  email: string;
  country: string;
}): Promise<Stripe.Account> {
  return getStripe().accounts.create({
    type: 'express',
    email: opts.email,
    country: opts.country,
    capabilities: {
      transfers: { requested: true },
    },
  });
}

export async function createAccountLink(accountId: string, returnUrl: string): Promise<string> {
  const link = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

export async function transferPayoutToCreator(opts: {
  accountId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  description: string;
}): Promise<Stripe.Transfer> {
  return getStripe().transfers.create(
    {
      amount: opts.amountCents,
      currency: opts.currency.toLowerCase(),
      destination: opts.accountId,
      description: opts.description,
    },
    { idempotencyKey: opts.idempotencyKey },
  );
}
