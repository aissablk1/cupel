# Spec — Pricing Cupel

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-15
> Statut : v1 — adopté avec le pivot B2B Teams

## Principes

1. **L'annuaire public reste gratuit, à vie.** Browse, install via CLI, reviews, et publication de skills publics sont gratuits. C'est le moteur d'acquisition et de SEO.
2. **La valeur payante est la gouvernance, pas le contenu.** On ne fait pas payer le skill, on fait payer le contrôle.
3. **Self-serve jusqu'à Teams, sales-led à partir d'Enterprise.** Teams se prend en 3 clics avec carte ou SEPA. Enterprise demande un devis.
4. **Prix par seat, facturation mensuelle par défaut, annuel sur demande.**

## Plan Public — gratuit

**Cible** : tout dev, étudiant, freelance, créateur de skill open source.

**Inclus**
- Browse l'annuaire complet
- Install via `npx @aissabelkoussa/cupel install <slug>`
- Laisser des reviews (1–5 stars + commentaire)
- Publier des skills publics (signés Ed25519 par la plateforme)
- 1 workspace personnel solo
- Support communautaire (Discord, GitHub Discussions)

**Limites**
- Pas de skills internes non publics
- Pas de SSO, pas d'audit log, pas d'allowlist
- Pas de partage cross-IDE managé
- Pas de SLA

## Plan Teams — 9 €/seat/mois

**Cible** : équipes dev 5 à 50 personnes (startups, scale-ups, agences, studios).

**Conditions**
- Minimum 5 seats (= 45 €/mois plancher)
- Maximum 50 seats (au-delà, force upgrade Enterprise)
- Facturation Stripe Billing, carte ou SEPA, mensuel
- Annuel –15 % sur demande (= 7,65 €/seat/mois)
- Stripe Tax activé, TVA EU collectée automatiquement
- Reverse charge B2B intra-EU géré par Stripe

**Inclus (en plus de Public)**
- Workspace privé multi-membres
- Skills internes non publics (upload privé, visible workspace uniquement)
- SSO Google Workspace + Microsoft Entra ID (via WorkOS)
- Audit log complet (qui a installé / utilisé quel skill, quand, depuis quel IDE)
- Allowlist / blocklist de skills par workspace
- Partage cross-IDE (mapping Claude Code ↔ Cursor ↔ Codex ↔ Windsurf ↔ Gemini CLI)
- Customer Portal Stripe (gestion CB, factures, annulation self-serve)
- Support email J+1 ouvré

**Non inclus**
- SCIM provisioning (Enterprise)
- Confidential Compute (Enterprise)
- On-prem R2 mirror (Enterprise)
- SOC 2 report (Enterprise)
- Custom signing key (Enterprise)

## Plan Enterprise — 29 €/seat/mois

**Cible** : ETI, grands comptes, entreprises régulées (banque, santé, défense, secteur public).

**Conditions**
- Minimum 25 seats (= 725 €/mois plancher)
- Pas de maximum
- Contrat annuel par défaut, NET30 SEPA ou virement via Stripe Invoicing
- Devis signé hors plateforme
- DPA standardisé, sub-processors documentés

**Inclus (en plus de Teams)**
- SCIM provisioning (Okta, Entra ID, Google Workspace)
- Confidential Compute pipeline (AWS Nitro Enclaves, cf. ADR 0005)
- On-prem R2 mirror (skills cache self-hosted dans le VPC client)
- Custom signing key par tenant (généré, scellé Supabase Vault, exportable)
- SOC 2 Type II report (à partir Q2 2027)
- ISO 27001 (à partir Q3 2027)
- SLA 99,9 % avec crédits
- Support dédié Linear shared, J+4 h ouvré, escalade téléphone
- Customer Success Manager assigné
- Onboarding sur mesure (formation équipe, intégration SSO, audit initial)
- Compliance tags marketplace : SOC 2 ready, GDPR, HIPAA-aware, FedRAMP-ready

## Comparatif synthétique

| Capacité | Public | Teams | Enterprise |
|---|---|---|---|
| Browse annuaire public | oui | oui | oui |
| Install via CLI | oui | oui | oui |
| Reviews | oui | oui | oui |
| Publier skills publics | oui | oui | oui |
| Workspace privé | — | oui | oui |
| Skills internes non publics | — | oui | oui |
| SSO Google/Microsoft | — | oui | oui |
| Audit log | — | oui | oui |
| Allowlist / blocklist | — | oui | oui |
| Partage cross-IDE | — | oui | oui |
| Customer Portal Stripe | — | oui | oui |
| SCIM | — | — | oui |
| Confidential Compute | — | — | oui |
| On-prem mirror | — | — | oui |
| SOC 2 report | — | — | oui |
| Custom signing key | — | — | oui |
| SLA 99,9 % | — | — | oui |
| Support | communauté | email J+1 | Linear J+4 h, CSM |
| Seats min / max | 1 / 1 | 5 / 50 | 25 / ∞ |
| Prix | 0 € | 9 €/seat/mois | 29 €/seat/mois |

## Modèle facturation Stripe

| Plan | Stripe price ID (env) | Type | Recurrence |
|---|---|---|---|
| Teams mensuel | `STRIPE_PRICE_TEAMS_MONTHLY` | `licensed` per-seat | monthly |
| Teams annuel | `STRIPE_PRICE_TEAMS_ANNUAL` | `licensed` per-seat | yearly (–15 %) |
| Enterprise mensuel | `STRIPE_PRICE_ENTERPRISE_MONTHLY` | `licensed` per-seat | monthly |
| Enterprise annuel | `STRIPE_PRICE_ENTERPRISE_ANNUAL` | `licensed` per-seat | yearly (sur devis) |

Voir `docs/architecture/payments.md` pour le détail technique webhook et flow.

## Réductions

- **Startups** (< 2 ans, < 1 M€ ARR) : –50 % la première année sur Teams, sur dossier
- **Open source maintainers** : Teams gratuit jusqu'à 10 seats pour les projets OSS éligibles (≥ 1 k stars GitHub, licence OSI)
- **Éducation** (universités, écoles) : 70 % sur Teams et Enterprise, sur dossier
- **Annuel** : –15 % sur Teams, –10 à –20 % sur Enterprise selon engagement (1, 2, 3 ans)

## Évolutions envisagées (hors scope v1)

- Add-ons à la carte (Confidential Compute seul, audit log avancé seul) pour Teams qui ne veulent pas tout Enterprise
- Tarif région-spécifique (Asie, Amérique latine)
- Sponsoring de skills certifiés (créateurs touchent sur abonnements Teams qui les utilisent — modèle à valider en Phase 4)
