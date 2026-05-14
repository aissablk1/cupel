# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et ce
projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

Auteur : Aïssa BELKOUSSA.

---

## [Unreleased]

### Added

- Scripts ops : `healthcheck.sh`, `backup-db.sh`, `rotate-secrets.md`
- Scripts Lemon Squeezy : `setup-products.ts`, `sync-orders.ts`, `test-webhook.ts`
- Workflows CI : `deploy-preview.yml`, `migrations.yml`
- ADRs 0001 à 0005 (monorepo pnpm, Supabase, Lemon Squeezy, Ed25519, Confidential Computing)
- Spécifications : `roadmap.md`, `skill-spec.md`, `api-spec.md`
- Configuration éditeur : `.vscode/settings.json`, `.vscode/extensions.json`,
  `.vscode/css.customData.json`
- Configuration formatter : `.prettierrc`, `.prettierignore`
- `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`

### Changed

— (rien)

### Deprecated

— (rien)

### Removed

— (rien)

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
