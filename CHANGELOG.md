# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et ce
projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

Auteur : Aïssa BELKOUSSA.

---

## [Unreleased]

### Changed
- Consolidation identité projet : références « Forgekit » historiques remplacées par « cupel » (10 fichiers : `LICENSE`, `supabase/config.toml*`, `scripts/ops/healthcheck.sh`, `scripts/ops/backup-db.sh`, `packages/cli/.eslintrc.cjs`, `packages/doctor/_publish-doctor.sh`, `packages/cli/templates/SKILL.md.tmpl`, `packages/cli/templates/README.md.tmpl`, `.env.example`).
- `PROJECT.nfo` aligné sur v0.3.x CLI public + vitrine `apps/web` (status, version, repository public, tagline orienté CLI d'audit local).
- Monétisation Lemon Squeezy conservée dans la roadmap (CLI Pro, audit humain 400 €) — déclenchement futur, pas immédiat. CSP `apps/web/next.config.ts` conserve `*.lemonsqueezy.com`.
- `apps/web/next.config.ts` : `Permissions-Policy` complété avec `interest-cohort=()` (anti-FLoC).

### Date
- 2026-05-20

---

## [Consolidation] — 2026-05-20

Audit complet post-6-vagues mai 2026 (cf. `docs/audit/CONSOLIDATION_2026-05-20.md`).

### Findings principaux

- **CLI `@aissabelkoussa/cupel` v0.3.3 production-ready** — seul livrable mature, ROADMAP publique cohérente
- **16/16 tables publiques Supabase avec RLS + policies** — schéma sécurité solide (vérifié exhaustivement)
- **Headers next.config.ts production-grade** — CSP strict, HSTS preload, X-Frame-Options DENY
- **Aucune fuite `service_role` côté client** (grep exhaustif `apps/web/src apps/web/app packages/*/src`)

### Dette identifiée (à arbitrer par Aïssa avant v0.4)

- P0 : 10 fichiers techniques mentionnent encore « Forgekit » (`.env.example`, `LICENSE`, `supabase/config.toml*`, `scripts/ops/*`, `packages/cli/templates/*`, etc.)
- P0 : `PROJECT.nfo` désaligné (status pivot B2B, version 0.0.3 vs réalité CLI 0.3.3 public)
- P0 : section `[Unreleased]` obsolète (toute la trame pivot B2B Teams jamais sortie en release)
- P1 : `apps/web/` Next.js scaffolding inerte (pas de page produit live), `_defensive/` packages npm en quarantaine, `@lemonsqueezy/lemonsqueezy.js` zombie dans `packages/sdk`

### Recommandation

Continuer **sur le CLI uniquement**. Archiver `apps/web` + `_defensive` (option future à ressortir si traction CLI le justifie). Détails et TODO complet : `docs/audit/CONSOLIDATION_2026-05-20.md`.

---

## [0.3.3] — 2026-05-18

### Fixed (faux positif massif)

- **`tool_poisoning_directive`** : regex resserré pour ne plus matcher `BEFORE RESPONDING` seul. Le pattern d'attaque réel combine un marqueur de canal caché (HTML comment `<!-- SYSTEM: ... -->`, `IMPORTANT FOR ASSISTANT`, `HIDDEN INSTRUCTION`, `DO NOT TELL/MENTION/REVEAL USER`). Découverte : sur la machine de l'auteur, 14 sur 18 dangers étaient des skills `*-advisor` légitimes qui mentionnaient « before responding » dans leur description de persona.
- Nouveau test anti-faux-positif `does NOT flag legitimate persona skill mentioning "before responding"`. 37 → 38 tests verts.

Impact concret : machine de l'auteur passe de **18 → 4 dangers** (cohérent avec article blog).

## [0.3.2] — 2026-05-18

### Fixed (critique — package cassé en 0.3.1)

- **Retire `@cupel/shared` workspace dep** du `package.json` publié. La dépendance `workspace:*` leakait dans le tarball et bloquait tout `npm install` / `npx` avec `EUNSUPPORTEDPROTOCOL`. Le code de `@cupel/shared` est bundlé via tsup `noExternal`.
- Pivot du nom npm : `cupel` (refusé par la similar policy npm — too close to `cspell`) → `@aissabelkoussa/cupel` (scope perso). Le bin reste `cupel`, l'UX CLI ne change pas.
- 0.3.1 déprécié sur npm.

## [0.3.1] — 2026-05-18

### Added (UX + community)
- Header de scan sur `stderr` : « cupel scan — N platforms detected, local only, zero network… » au début, « N skills analysed in X.Xs » à la fin. N'apparaît PAS en mode `--json` ou `--sarif` (pas de pollution des pipes machine).
- Empty state explicite : si aucun skill détecté, liste les 6 plateformes scannées et suggère `cupel --path <dossier>` au lieu d'un lien vague.

### Changed
- Footer CTA séparé du rapport d'alerte : avant, le pitch « audit 400 € » apparaissait juste après les dangers (anti-pattern UX). Maintenant : action concrète d'inspection (`cupel --verbose`) en premier, CTA neutre identique en footer.

### Repository hygiene (pré-launch Show HN)
- `.github/SECURITY.md` : politique de divulgation, GitHub Private Vulnerability Reporting, fenêtres de réponse, transparency supply-chain
- `.github/ISSUE_TEMPLATE/*.yml` : 3 templates (bug, false positive, rule proposal RFC)
- `.github/PULL_REQUEST_TEMPLATE.md` : checklist (tests, conventional commits, no lifecycle scripts)
- `.github/CODEOWNERS` : revue obligatoire @aissablk1 sur paths critiques (doctor.ts, package.json, workflows)
- `.github/workflows/cupel-cli.yml` : CI dédiée CLI (Node 22 × ubuntu/macOS, typecheck, test, build, smoke tests SARIF, audit supply-chain, check absence de lifecycle scripts)
- `ROADMAP.md` : plan public v0.4 (réduction faux positifs) → v0.5 (cache incrémental) → v1.0 (AST + signatures)

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
