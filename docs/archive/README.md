---
Auteur: Aïssa BELKOUSSA
Date: 2026-05-15
Statut: archive (lecture seule)
---

# Archive Cupel

Ce dossier conserve, pour traçabilité, les modules et docs rendus obsolètes par les pivots successifs du produit. Les fichiers ici ne sont **plus importés** par le code de production et ne doivent **pas être réintroduits** sans relire le contexte du pivot correspondant.

## `v0-marketplace-payant/` — Pivot 2026-05-15

### Contexte

Cupel v0 visait un marketplace payant de skills IA individuels : achat one-shot ou abonnement par skill, paiement via Lemon Squeezy (Merchant of Record EU), payouts créateurs via Stripe Connect Express, revenue share 75/25.

Après audit de la traction préliminaire, de la concurrence (registres communautaires gratuits déjà installés — Anthropic Skills, awesome-claude-skills, plugins GitHub) et de la friction unitaire (TVA + KYC créateur + ticket moyen faible), le produit pivote vers :

1. **Annuaire gratuit** des skills (découvrabilité + audit sécurité = valeur publique)
2. **B2B Teams** payant (Stripe Billing standard, abonnements seat-based, factures NET30)

Le revenue share individuel par skill est abandonné. Stripe **Connect** devient inutile (pas de payouts à des tiers) ; on utilise désormais **Stripe Billing standard** côté Cupel en tant que vendeur direct B2B.

### Fichiers archivés

- `apps/web/app/[locale]/checkout/[skillId]/page.tsx` — page de checkout par skill (obsolète, pas de paiement unitaire)
- `packages/sdk/src/payments/lemonsqueezy.ts` — wrapper LS pour créer des checkouts one-shot
- `packages/sdk/src/payments/stripe-connect.ts` — création de comptes Express + transfers créateurs
- `docs/architecture/payments.md` — architecture paiements v0 (LS + Stripe Connect, revenue share)
- `scripts/lemonsqueezy/setup-products.ts` — bootstrap catalogue produits LS individuels
- `scripts/lemonsqueezy/sync-orders.ts` — sync historique des commandes LS

### Conservé en place (hors archive)

- `packages/sdk/src/payments/lemonsqueezy-webhook.ts` — helpers signature HMAC et parsing événements. Reste utile si l'on conserve LS comme MoR EU pour les abonnements Teams (arbitrage Stripe Billing vs LS Teams plan en cours).
- `scripts/lemonsqueezy/test-webhook.ts` — outil de test signature, indépendant du business model.

### Restauration

Aucune restauration prévue. Si un module doit reprendre du service, ré-importer depuis l'archive en réécrivant le header `ARCHIVED` et en validant explicitement contre l'architecture courante.
