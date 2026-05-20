---
title: Consolidation cupel — 20 mai 2026
auteur: Aïssa BELKOUSSA
date: 2026-05-20
contexte: post-6-vagues mai 2026 (CLAUDE.md §27)
---

## TL;DR

Le CLI `@aissabelkoussa/cupel` v0.3.3 est **production-ready** et c'est le seul livrable qui mérite ce statut aujourd'hui. Le scaffolding Next.js + Supabase + Stripe Billing existe mais reste **inerte** (zéro page produit live, aucun branchement Supabase réel testé, headers solides mais matcher middleware douteux). Six vagues d'autonomie ont accouché de **deux périmètres incohérents** : un CLI vivant publié sur npm, et une marketplace fantôme dont la roadmap publique ne parle plus. Prochaine action prioritaire : **trancher périmètre** (CLI-only vs CLI + marketplace) avant tout nouveau code, puis purger les références « Forgekit » qui traînent dans 10 fichiers techniques.

## État actuel

### Ce qui est fait (vague 1-4, valeur réelle)

- **CLI `@aissabelkoussa/cupel` v0.3.3 publié sur npm** — 14 règles de détection (regex), 30+ tests verts, SARIF 2.1.0, multi-plateformes (Claude Code, Cursor, Codex, Windsurf, Gemini, Continue, Copilot CLI), zéro réseau. C'est le cœur de valeur.
- **`@cupel/doctor` standalone** — alias léger du CLI pour `npx @cupel/doctor`, point d'entrée marketing.
- **Schéma Supabase complet et durci** — 7 migrations, **100 % des tables publiques avec `ENABLE ROW LEVEL SECURITY` + au moins une `CREATE POLICY`** (vérifié exhaustivement : `profiles`, `skills`, `skill_versions`, `purchases`, `subscriptions`, `reviews`, `installs`, `bundles`, `payouts`, `events`, `organizations`, `org_members`, `org_invites`, `org_skills`, `org_allowlist`, `audit_events`). Solide.
- **Headers HTTP `apps/web/next.config.ts`** — CSP strict (default-src 'self', frame-ancestors 'none'), HSTS (`max-age=63072000; includeSubDomains; preload`), Referrer-Policy, X-Content-Type-Options, Permissions-Policy. Production-ready.
- **Hygiène repo pre-launch** — `.github/SECURITY.md`, ISSUE_TEMPLATE, PULL_REQUEST_TEMPLATE, CODEOWNERS, workflow CI dédié CLI multi-OS. Sérieux.
- **DESIGN.md éditorial premium** — direction esthétique claire (Migra display + Geist body + Newsreader italic), tokens typographiques chiffrés, polices blacklist respectée.

### Ce qui est marginal / over-engineered (vague 5-6 à challenger)

- **`_defensive/` — 5 packages npm squat** (`cupel-cli`, `cupel-scanner`, `cupell`, `cuple`, `@cupel`) : utilité légitime (anti-typosquatting) **si publiés**, mais coût de maintenance non-nul. Décider : publier les 5 placeholders sur npm avec un README qui redirige, ou supprimer le dossier. État actuel = code mort sur disque.
- **`apps/web/` — Next.js scaffolding sans page produit live** — la marketplace web n'est pas dans la ROADMAP publique (qui pivote sur CLI-only v0.4 → v1.0). Mais le scaffolding `apps/web` reste, avec ses 30+ dépendances React 19 RC, Sentry, Stripe SDK, next-intl. **Pourquoi le garder s'il ne sert à rien de la roadmap publique ?**
- **`packages/sdk/` avec dépendance `@lemonsqueezy/lemonsqueezy.js`** alors que CHANGELOG annonce **abandon de Lemon Squeezy** en faveur de Stripe Billing. Code zombie.
- **`docs/specs/pricing.md` + `positioning.md` + `api-spec.md` + `skill-spec.md`** — écrits pour la marketplace B2B Teams, contradictoires avec ROADMAP.md (« Marketplace component only if community demand justifies »). Vague 5-6 d'over-doc.
- **`scripts/lemonsqueezy/test-webhook.ts`** — script LS marqué « Deprecated » dans CHANGELOG mais jamais supprimé.
- **`docs/archive/v0-marketplace-payant/`** — dossier d'archive saine, OK à garder.

## Incohérences détectées

| Type | Détail | Sévérité |
|---|---|---|
| **PROJECT.nfo désaligné** | annonce `Status: Phase 0 — pivot B2B Teams`, `Version: 0.0.3`, `Repository: privé`. Réalité : CLI v0.3.3 public sur npm, repo public GitHub, ROADMAP CLI-only. | Haute |
| **README ↔ ROADMAP** | README dit « Marketplace web (prévue) ». ROADMAP dit « Marketplace only if community demand ». Contradiction frontale. | Moyenne |
| **README ↔ tests** | README badge « tests 30/30 ». CHANGELOG 0.2.0 annonce 37 tests, 0.3.3 annonce 38 tests. Badge périmé. | Faible |
| **CHANGELOG [Unreleased]** | Toute la section « pivot B2B Teams » est encore dans `[Unreleased]` alors que les 4 versions suivantes (0.2 → 0.3.3) ont déjà été publiées sans intégrer le pivot. La section n'a plus de sens. | Moyenne |
| **`.env.example` + `.env.local`** | mentionnent encore `Forgekit` (ancien nom), `FORGEKIT_DEV_PORT`, `forgekit-skills`, `cdn.forgekit.dev`. Build et docs publiques exposent l'ancien nom. | Haute |
| **Fichiers « Forgekit » résiduels** | `LICENSE`, `.env.example`, `supabase/config.toml`, `supabase/config.toml.example`, `packages/doctor/_publish-doctor.sh`, `packages/cli/.eslintrc.cjs`, `scripts/ops/backup-db.sh`, `scripts/ops/healthcheck.sh`, `packages/cli/templates/SKILL.md.tmpl`, `packages/cli/templates/README.md.tmpl`. 10 fichiers à propager. | Haute |
| **`package.json` racine** | `description: "Marketplace de skills IA pour devs pro"` — obsolète après pivot CLI-only. `license: UNLICENSED` alors que sous-packages publiés MIT. Incohérent. | Moyenne |
| **ROADMAP.md** | en anglais, alors que README + CHANGELOG + PROJECT.nfo + docs/ sont en français. Choix éditorial à arbitrer (cible OSS internationale OK, mais l'incohérence saute aux yeux). | Faible |

## Audit sécu cupel

| Item | État | Action |
|---|---|---|
| RLS sur tables publiques | **OK 16/16** — toutes les tables `public.*` ont `ENABLE ROW LEVEL SECURITY` + ≥ 1 `CREATE POLICY` | Néant |
| Policies — couverture | Lecture/écriture séparées, scoping par `auth.uid()` + `org_members.role`, admin plateforme via `profiles.is_admin` | Audit manuel sur `org_allowlist` et `org_skills` recommandé avant prod |
| Headers HTTP next.config | CSP strict, HSTS preload, X-Frame-Options DENY, Permissions-Policy | Néant — état de l'art |
| CSP — anciennes refs | `frame-src https://*.lemonsqueezy.com` et `connect-src https://*.lemonsqueezy.com` alors que LS est abandonné | Retirer après confirmation pivot |
| `service_role` côté client | **Aucune fuite** — grep `apps/web/src apps/web/app packages/*/src` = 0 résultat | Néant |
| `.env.example` | `SUPABASE_SERVICE_ROLE_KEY` correctement marqué `# SERVER ONLY — jamais NEXT_PUBLIC` | Néant |
| `.env.local` | placeholders dev uniquement, dans `.gitignore` | Néant |
| middleware.ts | matcher `'/((?!_next\|api\|.*\\..*).*)'` **exclut `/api`** des vérifications Supabase auth. Acceptable si chaque route API fait son propre `getUser()`, à vérifier. | Audit des routes `app/api/**` |
| middleware.ts timeout | `Promise.race` avec 800 ms : si Supabase rame, on continue sans session. Choix défendable (disponibilité > strict auth) | Documenter en `docs/architecture/security.md` |
| Supply chain CLI | aucun lifecycle script dans `package.json` publié, vérifié par CI dédiée | Néant |
| Secrets en clair dans repo | rien trouvé via grep | Néant |
| `pnpm audit` | non lancé dans cette consolidation (lecture seule) | À lancer avant prochaine release |

## Dette technique identifiée

**P0 — Bloquant identité projet (KISS)**

1. Propager `Forgekit → Cupel` dans 10 fichiers résiduels (`.env.example`, `LICENSE`, `supabase/config.toml*`, `scripts/ops/*`, `packages/cli/.eslintrc.cjs`, `packages/doctor/_publish-doctor.sh`, `packages/cli/templates/*.tmpl`).
2. Actualiser `PROJECT.nfo` : status, version (CLI 0.3.3), repo public, modèle économique (CLI OSS + audit humain 400 €, plus marketplace en phase active).
3. Réconcilier CHANGELOG `[Unreleased]` — déplacer ou supprimer la section pivot B2B Teams obsolète.

**P1 — Code mort (YAGNI)**

4. Décider sort de `apps/web/` : (a) supprimer, (b) garder mais marquer `private + archive`, (c) le brancher réellement. **Aujourd'hui c'est ni l'un ni l'autre — dette pure**.
5. Décider sort de `_defensive/` : publier ou supprimer. Code en quarantaine permanente = no-go.
6. Retirer `@lemonsqueezy/lemonsqueezy.js` de `packages/sdk/package.json` + supprimer `scripts/lemonsqueezy/`.
7. Retirer `*.lemonsqueezy.com` de la CSP `next.config.ts`.

**P2 — Cohérence (DRY)**

8. Mettre badge tests à jour (`38/38` au lieu de `30/30`).
9. Choisir langue ROADMAP (EN ou FR, pas un par projet).
10. Description `package.json` racine alignée avec README (« audit local des skills IA » plutôt que « marketplace »).
11. `docs/specs/pricing.md` + `positioning.md` + `api-spec.md` + `skill-spec.md` — archiver dans `docs/archive/v1-marketplace-b2b-teams/` ou retirer.

## TODO de reprise (par priorité)

- **P0** — propager `Forgekit → Cupel` partout (1 grep + 10 patchs ciblés, 15 min).
- **P0** — actualiser `PROJECT.nfo` pour refléter la réalité publique (CLI live, v0.3.3, MIT, status « stable maintenance »).
- **P0** — trancher : `apps/web` archivé ou maintenu ? `_defensive` publié ou supprimé ?
- **P1** — purger refs Lemon Squeezy (sdk, scripts, CSP).
- **P1** — réécrire CHANGELOG `[Unreleased]` (vide ou plan v0.4) et déplacer pivot B2B Teams obsolète dans `docs/archive/`.
- **P2** — `pnpm audit` complet avant v0.4.0.
- **P2** — auditer manuellement routes `apps/web/app/api/**` pour confirmer que chacune appelle `getUser()` (middleware ne couvre pas `/api`).
- **P2** — documenter dans `docs/architecture/security.md` le choix middleware fail-open 800 ms.

## Décision : continuer / pivoter / archiver ?

**Continuer — mais sur le CLI uniquement.**

Le CLI a un produit, des utilisateurs potentiels (npm), une roadmap publique cohérente (v0.4 réduction faux positifs, v0.5 cache incrémental, v1.0 AST + signatures), une CI propre et un message clair (audit local zéro-réseau). C'est la valeur réelle des vagues 1-4.

La marketplace web + Stripe Billing + Teams 9 €/seat **n'a pas de traction**, pas de page live, pas de waitlist, pas de roadmap publique active. Le scaffolding est de l'over-engineering vague 5-6 qui coûte en dépendances, en surface d'attaque et en charge cognitive de maintenance. **Ne pas la supprimer aujourd'hui** (garder l'option) **mais ne plus la travailler** : archiver `apps/web` et `packages/sdk` dans `docs/archive/v2-marketplace-scaffolding/` ou les marquer `private + WIP frozen` dans le repo. Ressortir le tiroir uniquement si la traction CLI le justifie (cf. README : « quand la traction le justifiera »).

**Action minimale Aïssa (< 30 min)** : valider le périmètre CLI-only, valider P0 (propagation Forgekit → Cupel), confirmer archivage `apps/web` + `_defensive`. Le reste tombe naturellement.

---

## Pivot exécuté — 2026-05-20

### Décision périmètre

Périmètre confirmé par Aïssa le 2026-05-20 : **CLI public (v0.3.3 sur npm) + `apps/web` comme vitrine du CLI**. Lemon Squeezy conservé en dépendance et dans la CSP — monétisation différée (CLI Pro, audit humain 400 €).

### Fichiers Forgekit → cupel modifiés (10)

| Fichier | Nature du remplacement |
|---|---|
| `LICENSE` | Titre licence, mention npm packages publics (`@aissabelkoussa/cupel`, `@cupel/doctor`, `@cupel/sdk`), mention « marketplace Forgekit » → « via cupel » |
| `.env.example` | Header, `FORGEKIT_DEV_PORT` → `CUPEL_DEV_PORT`, `NEXT_PUBLIC_APP_NAME`, `R2_BUCKET_NAME` (`forgekit-skills` → `cupel-skills`), `R2_PUBLIC_URL` (`cdn.forgekit.dev` → `cdn.cupel.dev`), `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `RESEND_FROM_EMAIL` |
| `supabase/config.toml` | Header + `project_id = "cupel"` + `additional_redirect_urls` (forgekit.dev → cupel.dev). Pas de coupling runtime vérifié (`grep` 0 résultat dans `apps/`, `packages/`, `migrations/`) |
| `supabase/config.toml.example` | Idem `config.toml` |
| `scripts/ops/healthcheck.sh` | Header + env vars `CUPEL_WEB_URL` / `CUPEL_API_URL`, URL par défaut |
| `scripts/ops/backup-db.sh` | Header + nom des dumps (`cupel_${STAMP}.sql.gz`) + remote key R2 |
| `packages/doctor/_publish-doctor.sh` | Header `@cupel/doctor`, chemin d'exemple, test `npx @cupel/doctor@latest` |
| `packages/cli/.eslintrc.cjs` | Header de fichier |
| `packages/cli/templates/SKILL.md.tmpl` | Phrase « scaffoldé via `cupel init` » |
| `packages/cli/templates/README.md.tmpl` | Commande `cupel install`, lien de bas de page vers `cupel.dev` |

### Headers de sécurité — `apps/web/next.config.ts`

État avant intervention : déjà solide (HSTS preload `max-age=63072000; includeSubDomains; preload`, CSP strict avec `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`). CSP et HSTS conditionnés à `NODE_ENV === 'production'` (choix défendable, conservé).

Ajout : `Permissions-Policy` complété avec `interest-cohort=()` (anti-FLoC / Topics API). CSP `*.lemonsqueezy.com` **conservée** sur ordre explicite Aïssa (CLI Pro à venir).

### PROJECT.nfo aligné

- `Project: cupel` (au lieu de « Cupel — nom de travail »)
- `Tagline:` reformulé vers « CLI d'audit local des skills IA — zéro réseau, multi-plateformes »
- `Status: v0.3.x — CLI public on npm + apps/web vitrine`
- `Version: 0.3.3` (CLI `@aissabelkoussa/cupel` synchronisé avec `packages/cli/package.json`)
- `Repository: aissablk1/cupel (public, GitHub)`
- `License: MIT (CLI publié) — propriétaire (apps/web vitrine)`
- `Updated: 2026-05-20`
- Sections STACK / STRUCTURE / INSTALL / USAGE refondues, mentions Lemon Squeezy déplacées en roadmap

### CHANGELOG

Nouvelle section `[Unreleased]` documente le pivot identitaire + ajustement `Permissions-Policy`. Section « Consolidation » initiale conservée comme entrée historique.

### Build

- `pnpm --filter web build` : OK, 19 routes statiques générées, TypeScript clean.
- `pnpm --filter @aissabelkoussa/cupel build` : **échec préexistant** (résolution `@cupel/shared` dans tsup, identique avant et après mes changements — bug indépendant documenté CHANGELOG 0.3.2). Aucune régression introduite.

### Ambiguïtés laissées

- **CHANGELOG ligne 25** : mention historique « 10 fichiers techniques mentionnent encore « Forgekit » » conservée dans la note « Consolidation » du 2026-05-20. C'est une note QA historique légitime, le mot apparaît dans un contexte explicitement passé. Non remplacé.

### Commit

- SHA : `6e6143a0cc45a16215cacde3a8dc19b63450f58a`
- Message : `refactor: consolidate identity (Forgekit→cupel) + harden security headers`
- 13 fichiers stagés un par un par chemin explicite (CLAUDE.md §7), pas de push, pas de co-author IA.
- Branche : `main`, 2 commits d'avance sur `origin/main`.

### Snapshot

`_backup/pivot_2026-05-20_18h26/` — 13 fichiers patchés + `next.config.ts` + `package.json` racine + sous-packages clés.

