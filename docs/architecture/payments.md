# Architecture — Paiements

> Forgekit utilise **Stripe Billing** pour les abonnements B2B (plans Teams et Enterprise). L'annuaire public reste gratuit : aucun paiement n'est requis pour browse, installer un skill via le CLI ou laisser une review.
> Auteur : Aïssa BELKOUSSA
> Mis à jour : 2026-05-15 (pivot B2B Teams)

## Vue d'ensemble

```
┌────────────┐  upgrade plan  ┌──────────────────┐
│ Admin team │ ─────────────▶ │ Stripe Billing   │
│ (web)      │                │ Checkout + Portal│
└────────────┘ ◀── invoice ── └────────┬─────────┘
                                       │ webhook (signed)
                                       ▼
                              ┌──────────────────┐
                              │ Edge Function    │
                              │ Supabase Deno    │
                              │ — verify sig     │
                              │ — sync workspace │
                              │ — set seats      │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │ Postgres         │
                              │ workspaces       │
                              │ subscriptions    │
                              │ seats            │
                              └──────────────────┘
```

## Plans facturés

| Plan | Prix | Modèle Stripe | Détails |
|---|---|---|---|
| Public | gratuit | — | aucun objet Stripe |
| Teams | 9 €/seat/mois | `licensed` per-seat, monthly | 5 seats min, 50 seats max |
| Enterprise | 29 €/seat/mois | `licensed` per-seat, monthly ou annual | 25 seats min, contrat custom |

Annuel disponible sur demande (Enterprise) avec PO/NET30 via Stripe Invoicing.

## Flow Teams (self-serve)

1. Admin crée un workspace gratuit, invite collègues
2. Workspace hit la limite Public (skills internes / SSO / audit)
3. Clic « Upgrade to Teams » → Server Action crée Stripe Checkout Session (mode `subscription`, `quantity = seats`)
4. Stripe Checkout hosted → carte ou SEPA
5. Webhook `checkout.session.completed` → Edge Function `stripe-webhook`
   - Vérifie signature `Stripe-Signature`
   - Crée `subscriptions` + lie `workspace_id`
   - Active features Teams (SSO, audit, allowlist, private skills)
6. Webhook `customer.subscription.updated` → ajuste `seats`, `status`
7. Webhook `invoice.payment_failed` → grace period 7 j, dégrade vers Public si non résolu
8. Webhook `customer.subscription.deleted` → workspace passe en Public (skills internes conservés read-only)

## Flow Enterprise (sales-led)

- Devis hors plateforme, contrat signé
- Stripe Invoicing : facture annuelle SEPA/virement, NET30
- Provisioning manuel des features (SCIM, Confidential Compute, on-prem mirror)
- Signing key custom générée et stockée en Supabase Vault
- Renouvellement géré par Customer Success (rappel J-60)

## Seats

- Ajout d'un membre au workspace = `subscriptions.update({ quantity: n+1 })` avec proration
- Retrait = proration créditée sur facture suivante
- Plafonds : Teams hard cap 50 seats (au-delà, force upgrade Enterprise)

## TVA et facturation

- Stripe Tax activé (auto-calcul TVA EU, gestion seuils OSS)
- Forgekit reste vendeur (pas de MoR) — KBis FR, SIREN exposé sur facture
- Numérotation factures déléguée à Stripe Invoicing
- Reverse charge B2B intra-EU géré par Stripe Tax

## Sécurité

- Webhook signature Stripe vérifiée avec `stripe.webhooks.constructEvent` + `timingSafeEqual`
- Secret stocké en `STRIPE_WEBHOOK_SECRET` (Supabase Vault en prod)
- Idempotency-Key Stripe sur toute mutation côté serveur
- Pas de stockage carte/IBAN côté Forgekit (PCI-DSS SAQ-A)
- Customer Portal Stripe pour gestion CB, factures, annulation

## Variables d'environnement

```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_TEAMS_MONTHLY
STRIPE_PRICE_ENTERPRISE_MONTHLY
STRIPE_PRICE_ENTERPRISE_ANNUAL
STRIPE_TAX_ENABLED=true
```

## Tests

- Stripe test mode : `sk_test_…`, `whsec_test_…`
- Webhook local : `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`
- Cartes test : `4242 4242 4242 4242` (succès), `4000 0000 0000 0341` (échec recurring)
- SEPA test : `DE89370400440532013000`

## Phases

- **Phase 1** (lancement, M1–M3) : Public gratuit + Teams self-serve via Stripe Checkout, factures Stripe automatiques.
- **Phase 2** (M4–M6) : Customer Portal complet, gestion seats UI, dunning automatisé.
- **Phase 3** (M7+) : Enterprise sales-led, Stripe Invoicing PO/NET30, contrats annuels, SCIM provisioning.

## Hors scope (abandonné)

- **Revenue share créateurs 75/25** : abandonné avec le pivot 2026-05-15. Les skills publics restent gratuits, les créateurs ne sont pas rémunérés à la vente. Une rémunération indirecte (sponsoring de skills certifiés, programme partenaires) sera étudiée en Phase 3.
- **Lemon Squeezy MoR** : remplacé par Stripe Billing direct, modèle B2B subscription incompatible avec le pattern MoR EU de LS pour cette taille de ticket.
- **Stripe Connect Express** : plus nécessaire (pas de payouts créateurs).
