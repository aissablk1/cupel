> **ARCHIVED 2026-05-15** — Pivot v0 marketplace payant individuel → annuaire gratuit + B2B Teams. Document conservé pour traçabilité, ne reflète plus l'architecture cible. Voir `docs/archive/README.md`.

# Architecture — Paiements (v0, archivé)

> Cupel utilise **Lemon Squeezy** comme Merchant of Record EU (gère TVA + facturation) et **Stripe Connect** pour les payouts aux créateurs en phase 2.
> Author : Aïssa BELKOUSSA

## Vue d'ensemble

```
┌────────────┐    achat skill     ┌──────────────────┐
│ Acheteur   │ ─────────────────▶ │ Lemon Squeezy    │
│ (web)      │                    │ (MoR EU)         │
└────────────┘ ◀──── receipt ──── └────────┬─────────┘
                                           │ webhook
                                           ▼
                                  ┌──────────────────┐
                                  │ Edge Function    │
                                  │ Supabase Deno    │
                                  │ — verify HMAC    │
                                  │ — insert purchase│
                                  │ — split revenue  │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Postgres         │
                                  │ purchases table  │
                                  └──────────────────┘

Mensuel cron :
   ┌──────────────────────────────┐    transfers    ┌─────────────┐
   │ cron-payouts Edge Function   │ ──────────────▶ │ Stripe       │
   │ — calcule total créateur     │                 │ Connect      │
   │ — transfer Stripe            │ ◀── webhook ─── │ (Express)    │
   └──────────────────────────────┘                 └─────────────┘
```

## Revenue share

- **Créateur** : 75 % du net après TVA
- **Plateforme** : 25 %
- Calcul **toujours en cents entiers** : `platform = round(net * 0.25)` puis `creator = net - platform`
- Voir `packages/shared/src/utils/index.ts` : `splitRevenue()`

## Flow d'achat one-shot

1. Acheteur clique "Acheter" sur `/skills/[slug]`
2. Server Action crée un checkout LS via `createSkillCheckout()` avec `custom_data: { user_id, skill_id }`
3. Redirect vers LS hosted checkout (ou overlay)
4. Paiement validé → LS envoie webhook signé HMAC-SHA256
5. Edge Function `lemonsqueezy-webhook` vérifie signature, parse event
6. Sur `order_created` : insert `purchases` avec split, status `completed`
7. Sur `order_refunded` : update purchase status `refunded`
8. Email confirmation envoyé via Resend (event downstream)

## Flow abonnement

- LS gère le cycle complet (création, renouvellement, échec, annulation)
- Webhook handle `subscription_created/updated/cancelled/expired/resumed`
- Table `subscriptions` synchronisée 1:1 avec LS
- Accès skill = subscription `active` OU purchase one-shot `completed`

## TVA

- LS collecte et reverse la TVA EU automatiquement (MoR)
- Cupel stocke `vat_cents` pour reporting interne mais ne facture pas la TVA séparément
- Voir `computeVAT()` dans `@cupel/shared` pour preview UI uniquement

## Sécurité

- Webhook signature : HMAC-SHA256 vérifiée avec `timingSafeEqual`
- Secret stocké en `LEMONSQUEEZY_WEBHOOK_SECRET` (Supabase Vault en prod)
- Idempotency : table `purchases` a `unique(user_id, skill_id, ls_order_id)` — doublons rejetés
- Pas de stockage carte / IBAN côté Cupel
- Stripe Connect : KYC géré par Stripe (Express accounts)

## Variables d'environnement

```
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_WEBHOOK_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CONNECT_CLIENT_ID
```

## Tests

- Sandbox LS : compte test séparé, store_id distinct
- Stripe : keys `sk_test_…`
- Webhook local : `ngrok http 54321` + `scripts/lemonsqueezy/test-webhook.ts`

## Phases

- **Phase 1** (lancement) : Lemon Squeezy seul, paiements en escrow Cupel, payouts manuels mensuels (virement perso ou Wise)
- **Phase 2** (M6+) : Stripe Connect Express activé, payouts automatiques le 5 de chaque mois
- **Phase 3** (M12+) : metering pay-per-use, factures B2B PO/NET30 pour Teams plan
