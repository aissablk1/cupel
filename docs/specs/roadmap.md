# Roadmap Forgekit — 12 mois

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-14
> Mis à jour : 2026-05-15 (pivot B2B Teams)
> Statut : Plan de travail solo-founder, ajusté mensuellement.

## Contexte du pivot 2026-05-15

Anthropic publie ses propres skills gratuitement et GitHub regorge de skills communautaires. Vendre un skill à l'unité (modèle initial 75/25) n'a plus de sens. La valeur capturable se déplace vers la gouvernance B2B : workspace privé, SSO, audit, allowlist, skills internes non publics, conformité. Voir `docs/specs/positioning.md` et `docs/specs/pricing.md`.

## Phase 0 — Scaffolding (M0, mai 2026)

**Objectif** : poser fondations techniques + identité projet + pivot documenté.

- Monorepo pnpm + Turborepo opérationnel
- Next.js 15 + Tailwind 4 + shadcn/ui en place
- Supabase EU provisionné, migrations versionnées
- ADRs 0001-0005 publiés
- Direction esthétique « Editorial Premium » figée (Migra + Geist)
- CI lint/test/build vert
- `PROJECT.nfo` + `README.md` + `LICENSE` + `CHANGELOG.md`
- **Pivot B2B Teams** documenté (pricing, positioning, payments)

**Done when** : `pnpm dev` lance le projet, `pnpm test` passe en CI, le pivot est lisible dans la doc.

## Phase 1 — Annuaire public gratuit (M1–M2, juin-juillet 2026)

**Objectif** : annuaire navigable, install CLI fonctionnel, 100 skills indexés.

- Schéma DB : `skills`, `skill_versions`, `users`, `workspaces`, `reviews`
- RLS strict (lecture publique pour skills publics, écriture restreinte)
- Auth GitHub + Google opérationnelle
- Browse public : recherche, filtres (stack, IDE, langue, tag)
- Upload skill via dashboard créateur (drag-drop zip ou import GitHub)
- Pipeline validation : static analysis + LLM review (Claude Haiku) + signature Ed25519
- `@forgekit/cli` publié sur npm (`npx forgekit install <slug>`)
- 100 skills seed (curation + import GitHub awesome lists)
- Reviews + ratings (1–5 stars)

**Done when** : un dev anonyme trouve un skill, l'installe via CLI, laisse une review.

## Phase 2 — Workspaces Teams self-serve (M3–M4, août-septembre 2026)

**Objectif** : premier plan payant. Teams en self-serve via Stripe Checkout.

- Workspaces multi-membres (invitations email)
- Skills internes non publics (upload privé, visible workspace uniquement)
- SSO Google Workspace + Microsoft Entra ID (WorkOS)
- Audit log : qui a installé/utilisé quel skill, quand
- Allowlist / blocklist de skills par workspace
- Partage cross-IDE (mapping Claude Code ↔ Cursor ↔ Codex ↔ Windsurf)
- **Stripe Billing** : Checkout Session, subscription per-seat 9 €/mois, Stripe Tax, Customer Portal
- Webhook handler complet (`checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`)
- Landing dédiée `/teams` + page comparaison plans
- Status page Statuspage, monitoring Sentry + Better Stack
- Product Hunt launch + 5 articles SEO

**KPI** : 5 workspaces Teams payants (≥ 25 seats cumulés), 200 skills indexés, 2 000 inscrits.

## Phase 3 — Enterprise & conformité (M5–M7, octobre-décembre 2026)

**Objectif** : premiers contrats Enterprise sales-led, conformité activable.

- Plan Enterprise 29 €/seat/mois (min 25 seats)
- SCIM provisioning (Okta, Entra ID, Google Workspace)
- Stripe Invoicing PO/NET30, contrats annuels SEPA/virement
- Confidential Compute pipeline (AWS Nitro Enclaves, cf. ADR 0005)
- On-prem R2 mirror (skills cache self-hosted)
- Custom signing key par tenant (Supabase Vault)
- Préparation SOC 2 Type I (politiques + Vanta)
- API publique read (catalog) + write (admin workspace)
- Webhooks workspace (sur publication / install / révocation)
- Skills certifiés « Forgekit Verified » (review humain payée par éditeur)

**KPI** : 2 contrats Enterprise (≥ 50 seats chacun), 15 workspaces Teams, 15 k€ MRR.

## Phase 4 — Écosystème & intégrations (M8–M10, janvier-mars 2027)

**Objectif** : devenir le standard de gouvernance multi-IDE.

- Intégrations natives : Cursor, Codex, Windsurf, Gemini CLI, JetBrains AI Assistant
- Programme partenaires éditeurs IDE (revshare sur referrals)
- Marketplace meta : tags compliance (SOC 2 ready, GDPR, HIPAA-aware)
- Transparency log Sigstore Rekor self-hosted EU
- Sponsoring de skills certifiés (créateurs touchent sur abonnements Teams qui les utilisent — modèle à valider)
- CLI v2 : profiles par workspace, auto-update, telemetry opt-in

**KPI** : 50 workspaces Teams, 5 Enterprise, 40 k€ MRR.

## Phase 5 — Scale & SOC 2 (M11–M12, avril-mai 2027)

**Objectif** : crédibilité grande entreprise.

- SOC 2 Type II audit (12 mois de logs requis, donc commencer M5)
- ISO 27001 (gap analysis)
- DPA standardisé, sub-processors page publique
- Enterprise SLA 99,9 % + support dédié (Linear shared)
- Bilan 12 mois, levée éventuelle ou bootstrap continu

**KPI cible 12 M** : 50 k€ MRR, 10 Enterprise, 100 workspaces Teams, 5 000 skills indexés.

## Risques transverses

| Risque | Mitigation |
|---|---|
| Anthropic ou GitHub lance un control plane B2B équivalent | Vitesse + curation EU + Confidential Compute différenciateur |
| Skills internes des entreprises ne quittent pas leur Git | Argumentaire : Forgekit n'exfiltre pas, le code reste chez Supabase EU / on-prem mirror |
| Dépendance Claude Code | Multi-IDE dès Phase 2 (mapping cross-IDE inclus dans Teams) |
| Coût Vercel / Supabase au scale | Alertes spend, ADR sortie planifié |
| Solo-founder bandwidth | Sub-traitance design / RA / SOC 2 selon besoin |
| Compliance EU AI Act + DORA | ADR 0005 + suivi DGFIP, audit annuel, DPA standardisé |

## Hors scope (abandonné au pivot)

- Marketplace payant à l'unité (vente skill 29 €) — Anthropic + GitHub gratuits rendent le modèle non-viable
- Revenue share créateurs 75/25 — remplacé par sponsoring de skills certifiés en Phase 4
- Lemon Squeezy + Stripe Connect — remplacé par Stripe Billing direct (B2B subscription)
