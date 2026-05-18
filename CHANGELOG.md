# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et ce
projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

Auteur : Aïssa BELKOUSSA.

---

## [0.3.0] — 2026-05-18

### Added
- `--sarif` : sortie SARIF 2.1.0 pour intégration native GitHub Code Scanning, GitLab Code Quality, VS Code SARIF Viewer
- Mapping des règles vers le schéma SARIF (`error`/`warning`/`note`) basé sur le poids interne

### Changed
- Description npm mise à jour pour refléter 14 catégories de détection
- Documentation README/page produit/article blog : « 11 catégories » → « 14 catégories »

## [0.2.0] — 2026-05-18

### Added — 3 règles 2026 (réaction à Snyk ToxicSkills + Invariant Labs MCP poisoning)
- **`invisible_unicode`** (poids 45) — détection ASCII smuggling : zero-width characters (`U+200B-200F`), RLO/LRO/PDF overrides (`U+202A-202E`), Unicode Tags (`U+E0000-E007F`)
- **`tool_poisoning_directive`** (poids 40) — directives cachées ciblant l'agent : commentaires HTML `<!-- SYSTEM/INTERNAL/ASSISTANT: ... -->`, patterns « IMPORTANT FOR ASSISTANT », « BEFORE RESPONDING », « HIDDEN INSTRUCTION », « DO NOT TELL THE USER »
- **`hex_escape_chain`** (poids 30) — obfuscation par séquences d'échappements consécutives : `\xNN\xNN…` (≥ 8), `\uNNNN\uNNNN…` (≥ 6), `String.fromCharCode(N,N,…)` (≥ 11 codes)

### Tests
- 7 nouveaux tests pour les règles 2026 (5 cas positifs + 1 cas RLO + 1 contrôle anti-faux-positif)
- Total : 30 → 37 tests verts

## [Unreleased]

### Added

- **`cupel doctor` réécrit en audit de risque local (2026-05-15)** — l'ancienne commande de diagnostic d'environnement devient un véritable audit de sécurité des skills IA installés localement
- Nouveau package public `@cupel/doctor` — utilisable sans installation via `npx @cupel/doctor`, pensé pour les devs qui veulent juste auditer sans adopter tout le CLI Cupel
- `cupel doctor` — scan multi-plateformes (7 plateformes supportées : Claude Code, Cursor, Codex, Windsurf, Gemini CLI, GitHub Copilot CLI, Continue), 7 règles de risque regex (secrets, exfiltration, shell injection…), 4 signaux structurels (taille, profondeur, dépendances, permissions)
- `cupel doctor` — trois formats de sortie : rapport humain coloré, JSON machine-readable (`--json`), mode strict CI (`--strict`, exit ≠ 0 si risque détecté)
- `cupel doctor` — zéro réseau, 100 % local : aucune télémétrie, aucun upload, aucune dépendance cloud
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

[Unreleased]: https://github.com/aissablk1/cupel/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/aissablk1/cupel/releases/tag/v0.0.1
