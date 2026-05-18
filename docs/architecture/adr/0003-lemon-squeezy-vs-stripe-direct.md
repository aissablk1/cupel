# ADR 0003 — Lemon Squeezy (MoR) vs Stripe direct

- Statut : Accepté
- Date : 2026-05-14
- Auteur : Aïssa BELKOUSSA

## Contexte

Cupel vend des skills à des devs partout dans le monde, dont 60–70 %
attendus en EU + UK + USA. Cela implique :

- Collecte de la TVA EU OSS (≥1 country) + TVA UK + sales tax USA (>30 États)
- Facturation conforme (mention TVA, numéro entreprise du payeur)
- Reversement aux créateurs (75 %) — payouts cross-border
- Échecs de paiement, refunds, chargebacks

Options :

1. **Stripe direct** + integration manuelle TVA (Stripe Tax) + facturation maison
2. **Lemon Squeezy** comme Merchant of Record (MoR) — LS facture l'acheteur,
   collecte / reverse la TVA, Cupel reçoit une enveloppe nette
3. **Paddle** MoR équivalent
4. **Stripe Connect Express** côté créateur + Stripe Tax côté plateforme

## Décision

**Phase 1 (lancement → M6)** : Lemon Squeezy comme MoR exclusif.
**Phase 2 (M6 → M12)** : ajout de Stripe Connect pour les payouts automatiques
aux créateurs (KYC géré par Stripe).
**Phase 3 (M12+)** : évaluer migration Stripe direct si volume justifie
l'internalisation de la compliance fiscale (>$100k ARR EU).

## Conséquences

**Positives :**

- Conformité TVA EU / UK / USA déléguée — gain énorme en time-to-market
- Pas besoin d'un comptable dédié EU OSS dès le jour 1
- LS gère échecs / retries / dunning subscriptions natifs
- Webhook HMAC-SHA256 simple à vérifier (voir `docs/architecture/payments.md`)

**Négatives :**

- Fee LS : 5 % + $0.50 par transaction → marge plateforme passe de 25 % à ~19 %
  net après TVA et fees
- Pas de pricing dynamique fin (LS limite à ~10 prix par variant)
- Payouts initiaux manuels (virement Wise) jusqu'à phase 2 → friction créateurs

## Modélisation du split

Pour un achat à 29 €  HT :

| Poste | Montant |
|---|---|
| Brut acheteur (TTC) | 34.80 € |
| TVA 20 % (LS collecte) | 5.80 € |
| Fee LS 5 % + 0.50 | 1.95 € |
| Net Cupel | 26.55 € |
| Part créateur 75 % | 19.91 € |
| Part plateforme 25 % | 6.64 € |

Le split est calculé sur le **net après TVA et fees LS**, en cents entiers
(voir `splitRevenue()` dans `@cupel/shared`).

## Alternatives rejetées

- **Stripe direct** : compliance TVA EU OSS = >40 h/an + risque audit DGFIP
- **Paddle** : équivalent fonctionnel à LS mais DX inférieure, dashboard
  moins lisible, payouts moins flexibles
- **Stripe Connect seul** : Cupel deviendrait MoR de facto = même
  problème TVA

## Références

- LS for MoR : https://www.lemonsqueezy.com/help/merchant-of-record
- Stripe Tax limites : https://stripe.com/docs/tax
- TVA EU OSS : https://vat-one-stop-shop.ec.europa.eu/
