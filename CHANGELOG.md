# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et ce
projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

Auteur : Aïssa BELKOUSSA.

---

## [Unreleased]

### Added

- **Pivot B2B Teams (2026-05-15)** : annuaire public gratuit + plans payants Teams (9 €/seat/mois, 5–50 seats) et Enterprise (29 €/seat/mois, ≥ 25 seats)
- `docs/specs/pricing.md` — détail des 3 plans (Public, Teams, Enterprise), comparatif, réductions, IDs Stripe
- `docs/specs/positioning.md` — positionnement, cibles, messaging, concurrence, anti-positionnement
- `docs/sessions/2026-05-15_pivot-b2b-teams.md` — journal QQOQCCP du pivot
- Scripts ops : `healthcheck.sh`, `backup-db.sh`, `rotate-secrets.md`
- Workflows CI : `deploy-preview.yml`, `migrations.yml`
- ADRs 0001 à 0005 (monorepo pnpm, Supabase, Lemon Squeezy, Ed25519, Confidential Computing)
- Spécifications : `roadmap.md`, `skill-spec.md`, `api-spec.md`
- Configuration éditeur : `.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/css.customData.json`
- Configuration formatter : `.prettierrc`, `.prettierignore`
- `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`

### Changed

- `PROJECT.nfo` — tagline, description, statut, modèle économique mis à jour pour le pivot B2B Teams (v0.0.2)
- `README.md` — positionnement réécrit, tableau des 3 plans, stack paiement passe à Stripe Billing
- `docs/architecture/payments.md` — réécrit pour Stripe Billing (subscriptions per-seat) en remplacement de Lemon Squeezy + Stripe Connect
- `docs/specs/roadmap.md` — phases révisées : Phase 1 annuaire gratuit, Phase 2 Teams self-serve, Phase 3 Enterprise sales-led

### Deprecated

- Scripts Lemon Squeezy (`setup-products.ts`, `sync-orders.ts`, `test-webhook.ts`) — à remplacer par scripts Stripe Billing en Phase 2

### Removed

- Modèle marketplace payant à l'unité (vente skill 29 €) — abandonné, Anthropic + GitHub gratuits rendent le modèle non-viable
- Revenue share créateurs 75/25 — remplacé éventuellement par sponsoring de skills certifiés en Phase 4
- Intégration Lemon Squeezy MoR — remplacée par Stripe Billing direct
- Intégration Stripe Connect Express (payouts créateurs) — sans objet avec le pivot

### Fixed

— (rien)

### Security

— (rien)

---

## [0.0.1] — 2026-05-14

### Added

- Scaffolding initial du monorepo (pnpm + Turborepo)
- `PROJECT.nfo`, `README.md`, `DESIGN.md`
- Apps : `apps/web` (Next.js 15, Tailwind 4, shadcn/ui)
- Packages : `cli`, `sdk`, `security`, `shared`
- Supabase : structure `migrations/` + `functions/`
- Workflows CI : `ci.yml`, `deploy-prod.yml`, `release-cli.yml`, `security-scan.yml`
- Documentation architecture : `payments.md`, `observability.md`, `runbooks.md`

[Unreleased]: https://github.com/aissablk1/forgekit-marketplace/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/aissablk1/forgekit-marketplace/releases/tag/v0.0.1
