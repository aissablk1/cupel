---
title: Patch Next.js CVE wave 06/05/2026 — Vague 1
auteur: Aïssa BELKOUSSA
date: 2026-05-20
projets: cupel, VIRGA, VALIBAN
---

## Résultat par projet

| Projet  | Avant   | Après   | Build | Commit | Statut |
|---------|---------|---------|-------|--------|--------|
| cupel   | 15.0.0  | 15.0.0  | ✗     | -      | KO — rollback effectué |
| VIRGA   | ^15.5.4 | ^15.5.4 | -     | -      | SKIP — working tree dirty (`apps/web/package.json` + `pnpm-lock.yaml` déjà modifiés par une autre session) |
| VALIBAN | 16.2.2  | 16.2.6  | ✓     | -      | PATCHÉ — pas de repo git, fichiers modifiés en place, commit impossible |

## Détails

### cupel — KO (rollback)
- Snapshot : `_backup/nextjs_patch_2026-05-20_17h18/` (package.json racine + apps/web + pnpm-lock.yaml)
- Edition : `apps/web/package.json` next 15.0.0 → 15.5.18
- `pnpm install --no-frozen-lockfile` OK (44 s, 10 packages ajoutés, 3 deprecated subdeps glob/node-domexception/uuid)
- `pnpm build` (apps/web) : **échec TypeScript**
  - Erreur : `Type 'typeof import("…/app/[locale]/layout")' does not satisfy the constraint 'LayoutConfig<"/[locale]">'`
  - Cause : durcissement des types `LayoutProps` dans Next 15.5.x — `params: Promise<{ locale: "fr" | "en" }>` n'est plus assignable à `Promise<{ locale: string }>`
  - Régression typage côté Next, pas un bug d'Aïssa
- Action : **revert immédiat** depuis `_backup/`, working tree de package.json/lock restauré (next 15.0.0)
- TODO Aïssa : assouplir le type de `params` dans `apps/web/app/[locale]/layout.tsx` (passer `locale: string` ou caster) avant de rejouer le bump, ou attendre 15.5.x patch type. Snapshot conservé pour rejeu.

### VIRGA — SKIP (autre session)
- `git status` détecte 38 fichiers modifiés dont `apps/web/package.json` et `pnpm-lock.yaml`
- CLAUDE.md §7 (sessions parallèles) : interdiction d'embarquer le travail d'une autre session
- Aucune modification effectuée. À reprendre **après** que la session en cours ait commit/clean.

### VALIBAN — PATCHÉ sans commit
- Snapshot : `_backup/nextjs_patch_2026-05-20_17h18/` (package.json + pnpm-lock.yaml du dossier `apps/frontend`)
- Edition : `apps/frontend/package.json` next 16.2.2 → 16.2.6
- `pnpm install --no-frozen-lockfile` OK
- `pnpm build` initial bloqué par `ERR_PNPM_IGNORED_BUILDS` (sharp + unrs-resolver, hook pnpm 11, préexistant)
- Build de vérification via `npx next build` direct : **OK** (17 routes statiques générées, TypeScript OK 3.5 s)
- **Pas de repo git** dans VALIBAN (ni à la racine, ni dans `apps/frontend`) → aucun commit possible
- TODO Aïssa : décider si VALIBAN doit être initialisé en git (`git init` + premier commit), ou bien recopier manuellement les changements vers le futur repo

## Push restant à faire (par Aïssa)

Aucun. Aucun commit créé.

- cupel : rien à push, patch reverté
- VIRGA : non patché
- VALIBAN : fichiers modifiés en place dans le workspace, à valider/figer manuellement par Aïssa

## Vague 2 (à programmer)

- DropOrch (16.2.2 → 16.2.6)
- SELFPOD (14.0.4 → décision pending : 14.2.x dernier patch de la branche 14, ou bump majeur ?)
- Handler Catcher (14.2.0 → décision pending : idem)

## Reprise de cupel — checklist proposée

1. Lire `apps/web/app/[locale]/layout.tsx` et adoucir le type de `params` en `Promise<{ locale: string }>` (avec narrowing interne `locale === "fr" | "en"`)
2. Relancer le patch 15.0.0 → 15.5.18 depuis le snapshot
3. `pnpm install --no-frozen-lockfile && pnpm --filter web build`
4. Si OK : commit explicite `apps/web/package.json` + `pnpm-lock.yaml`
5. Vérifier en parallèle si d'autres `Layout`/`Page` du projet ont le même pattern de typage strict des params

## Snapshots conservés

- `/Volumes/Professionnel/Projets/Développement/Concepts/cupel/_backup/nextjs_patch_2026-05-20_17h18/`
- `/Volumes/Professionnel/Projets/Développement/Concepts/VALIBAN/_backup/nextjs_patch_2026-05-20_17h18/`
- `/Volumes/Professionnel/Projets/Développement/Concepts/DropOrch/_backup/nextjs_patch_2026-05-20_17h45/`

---

## Suivi VALIBAN — git init (2026-05-20 17h40)

- **Statut** : OK
- **Branche** : `main`
- **Commit initial** : `325ae92f543e0257750b37c234f2bf136bf6aaff`
- **Message** : `initial commit: VALIBAN baseline + next 16.2.6 (CVE wave fix)`
- **Auteur git** : `Aïssa BELKOUSSA <contact@aissabelkoussa.fr>`
- **Fichiers tracked** : 218
- `.gitignore` préexistant (node_modules, .next, dist, .env*, !.env.example, .DS_Store, *.log, .vercel)
- 2 fichiers `.env` retirés du staging avant commit (`config.env` racine + `apps/backend/config.env`) : pas de secrets réels dedans (URLs publiques + clés commentées), retirés par précaution stricte CLAUDE.md §5. Action Aïssa : copier en `.env.example` si nécessaire.
- Pas de push (CLAUDE.md §7), pas de Co-Authored-By IA (CLAUDE.md §21)

## DropOrch — patch 16.2.6 (2026-05-20 17h45)

- **Statut** : PATCHÉ sans commit (pas de repo git, comme VALIBAN initialement)
- **Snapshot** : `_backup/nextjs_patch_2026-05-20_17h45/` (apps/package.json + apps/frontend/package.json + apps/pnpm-lock.yaml)
- **Édition** : `apps/frontend/package.json` next 16.2.2 → 16.2.6
- **Lockfile** : `apps/pnpm-lock.yaml` mis à jour (`next@16.2.6` resolved, integrity sha512-qOVgKJg1+At15N…)
- `pnpm install --no-frozen-lockfile` (workspace `apps/`) OK, 12.5 s, 151 packages
- `pnpm build` (apps/frontend) **OK** : 26 routes générées (404, 500, /api dynamic, /auth/*, /checkout, /contact, /cookies, /dashboard + 7 sous-routes, /features, /help, /infrastructure, /offline, /pricing, /privacy, /solutions, /status, /terms)
- **Pas de repo git** dans DropOrch → aucun commit possible
- TODO Aïssa : `git init` DropOrch sur le même modèle que VALIBAN si désiré, sinon laisser fichiers modifiés en place

### Bilan vague 2

| Projet  | Avant   | Après   | Build | Commit | Statut |
|---------|---------|---------|-------|--------|--------|
| DropOrch | 16.2.2  | 16.2.6  | ✓     | -      | PATCHÉ — pas de repo git, fichiers modifiés en place |
| SELFPOD  | 14.0.4  | -       | -     | -      | Pending — décision branche 14 vs majeur |
| Handler Catcher | 14.2.0 | -    | -     | -      | Pending — idem |

## Cupel — Bump 16.x (rejeu vague 1)

- **Statut** : OK
- **Saut** : 15.0.0 → 16.2.6 (saut technologique demandé pour éviter le durcissement 15.5)
- **Snapshot** : `_backup/nextjs_bump_16x_rejeu_2026-05-20_17h40/`
- **Commit SHA** : `d1c472e6f04ded0544294a6215cf21c95348b37a`
- **Auteur** : Aïssa BELKOUSSA seul (pas de Co-Authored-By IA)
- **Build** : 19/19 pages, TypeScript clean, 2.5 s compile

### Fichiers modifiés (15)

- `apps/web/package.json` — next 15.0.0 → 16.2.6, next-intl 3.26 → 4.12, react/react-dom RC → 19.0.0 stable, eslint-config-next aligné
- `apps/web/next-env.d.ts` — auto-régénéré par Next 16 (ajout `./.next/types/routes.d.ts`)
- `apps/web/middleware.ts` — typage explicite `setAll(toSet: …)`
- `apps/web/lib/supabase/server.ts` — typage explicite `setAll(toSet: …)`
- `apps/web/app/[locale]/layout.tsx` — `params: Promise<{ locale: string }>` + cast `as Locale` après narrowing
- `apps/web/app/[locale]/page.tsx` — idem
- `apps/web/app/[locale]/cli/page.tsx` — idem
- `apps/web/app/[locale]/teams/page.tsx` — idem
- `apps/web/app/[locale]/pricing/page.tsx` — idem
- `apps/web/app/[locale]/skills/page.tsx` — idem
- `apps/web/app/[locale]/skills/[slug]/page.tsx` — idem + fix `skill.creator` traité comme array (Supabase relation typing)
- `apps/web/app/[locale]/(auth)/login/page.tsx` — idem
- `apps/web/app/[locale]/(dashboard)/creator/page.tsx` — idem
- `apps/web/app/[locale]/(dashboard)/dashboard/page.tsx` — idem + fix `p.skill` array
- `pnpm-lock.yaml` — résolutions next 16.2.6, next-intl 4.12, react 19.0.0

### Breaking changes rencontrés et corrigés

1. **LayoutProps/PageProps stricts** (le bloqueur de vague 1) : Next 16 attend `params: Promise<{ locale: string }>`, pas `Promise<{ locale: "fr" | "en" }>`. Fix : type `string` à la signature, cast vers `Locale` après narrowing via `locales.includes(...)`.
2. **Supabase relations typées array** (révélé par TS strict Next 16) : `skill:skills(...)` et `creator:profiles!fk(...)` retournent désormais `T[]` au lieu de `T`. Fix : `Array.isArray(x) ? x[0] : x` à l'extraction.
3. **Cookie `setAll` typage implicite any** : `cookieStore` et `req.cookies` ne propagent plus le type du callback. Fix : annotation explicite `(toSet: { name: string; value: string; options?: Record<string, unknown> }[])`.
4. **next-intl 3.x incompatible Next 16** : erreur runtime « Couldn't find next-intl config file » au prerender. Fix : bump next-intl `^3.26.0` → `^4.12.0` (companion bump).

### Warnings restants (non bloquants)

- `The "middleware" file convention is deprecated. Please use "proxy" instead.` — renommer `apps/web/middleware.ts` en `apps/web/proxy.ts` dans une PR de follow-up
- Peer dep `@sentry/nextjs 8.55.2` réclame `next ^13|14|15`, ne reconnaît pas encore Next 16 — fonctionne en pratique, attendre release Sentry compatible

### Pas de blocker restant.

## Handler Catcher — Bump 14 → 16.2.6 (2026-05-20)

**Chemin** : `/Volumes/Professionnel/Projets/Développement/Concepts/Handler Catcher/`

**Statut** : OK — build Turbopack vert, pas de commit (workspace hors git).

### Avant
- `apps/frontend/package.json` indiquait déjà `next: "16.2.6"` au moment de l'exécution (le patch package.json était déjà appliqué localement par le snapshot `_backup/nextjs_bump_16x_2026-05-20_17h52/` qui contient encore l'ancien `package.json` 14.2.0 d'origine).
- React/react-dom : `^19.0.0`, `eslint-config-next: 16.2.6`, `@types/react: ^19.0.0` — tous déjà alignés.
- Aucun lockfile en racine, install fait à partir du manifest.

### Modifications appliquées dans cette session
- `apps/frontend/package.json` — ajout `tailwindcss-animate: ^1.0.7` en `devDependencies` (dépendance manquante référencée par `tailwind.config.js` plugins, bloquait Turbopack en `Module not found`)
- `apps/frontend/pnpm-lock.yaml` — généré par `pnpm install --no-frozen-lockfile`

### Build
- `pnpm install --no-frozen-lockfile` : OK (732 deps résolues, 1 peer dep warning `eslint-config-next 16.2.6` qui exige `eslint >=9` alors que `eslint 8.57.1` installé — non bloquant pour build)
- `pnpm build` : `✓ Compiled successfully in 1337ms` puis TypeScript OK, 3 pages statiques pré-rendues (`/`, `/_not-found`)
- Next 16.2.6 a auto-mis-à-jour `tsconfig.json` (`jsx: react-jsx`, ajout `.next/dev/types/**/*.ts`) et régénéré `next-env.d.ts`

### Pas de breaking change Next.js rencontré
- Codebase frontend très minimaliste : `app/layout.tsx` + `app/page.tsx` + `globals.css` uniquement
- Aucun usage de `params`, `searchParams`, `cookies()`, `headers()`, `middleware.ts`, `swcMinify`, `experimental.serverActions`
- Aucune relation Supabase typée, pas de next-intl

### Fichiers modifiés (non commités, pas de repo git)
- `apps/frontend/package.json` (ajout `tailwindcss-animate`)
- `apps/frontend/pnpm-lock.yaml` (créé)
- `apps/frontend/tsconfig.json` (auto-update Next 16 : `jsx: react-jsx`)
- `apps/frontend/next-env.d.ts` (régénéré)
- `apps/frontend/.next/` (artefacts build)

### Notes
- Workspace non versionné (`git status` → not a git repo). Pas de SHA à fournir. Un `git init` est à programmer pour Handler Catcher si on veut tracer.
- Snapshot pré-existant conservé : `_backup/nextjs_bump_16x_2026-05-20_17h52/` (contient le `package.json` 14.2.0 original + `next.config.js` + `tsconfig.json` + dossier `app/`).
- Backend (`apps/backend`) non touché : pas de Next.js dedans.

### Pas de blocker restant.

## SELFPOD — Bump 14 → 16.2.6 (2026-05-20)

**Chemin** : `/Volumes/Professionnel/Projets/Développement/Concepts/SELFPOD/apps/frontend`
**Statut** : OK (build passé)

### Avant
- `next` : `^14.0.4` (lockfile : `14.2.33`)
- `react` / `react-dom` : `^18.2.0`
- `eslint-config-next` : `^14.0.4`
- `lucide-react` : `^0.294.0` (peer React 16-18)
- `eslint` : `^8.56.0`

### État à l'arrivée (patch partiel déjà appliqué à 17h52)
- `package.json` déjà bumpé vers 16.2.6 / React 19 (cohérent avec snapshot `_backup/nextjs_bump_16x_2026-05-20_17h52/`)
- Code source `app/jobs/[slug]/page.tsx` déjà migré aux `params: Promise<{ slug: string }>` (compatible Next 15+)
- Mais : lockfile encore Next 14, `node_modules` absent, build jamais lancé, blockers peer-deps non résolus

### Modifications appliquées dans cette session
- `lucide-react` : `^0.294.0` → `^0.460.0` (peer React 19 OK)
- `eslint` : `^8.56.0` → `^9.0.0` (requis par `eslint-config-next@16`)
- `app/globals.css` : déplacement de `@import url('fonts.googleapis')` AVANT les `@tailwind` (Turbopack strict sur `@import` après règles)
- `package-lock.json` : régénéré via `npm install` (390 packages)

### Build
- `npm run build` → OK avec **Next.js 16.2.6 (Turbopack)**
- 15 pages générées (5 statiques + 5 SSG `/jobs/[slug]` + 5 routes app)
- TypeScript : compilation OK (Next a auto-ajusté `tsconfig.json` : `moduleResolution: bundler`, `jsx: react-jsx`)

### Pas de breaking change Next.js bloquant rencontré
- Pas de `cookies()`, `headers()`, `draftMode()` dans le code
- Pas de `middleware.ts`
- Pas de `swcMinify` ni `experimental.serverActions` dans `next.config.js`
- `params` déjà en `Promise<>` (migration anticipée)

### Warnings restants (non bloquants)
- `eslint` config dans `next.config.js` plus supportée → clé `eslint: { ignoreDuringBuilds: false }` à retirer (cosmétique)
- `images.domains` deprecated → migrer vers `images.remotePatterns` (cosmétique, surtout que `output: 'export'` + `unoptimized: true`)
- `redirects` et `headers` ignorés avec `output: 'export'` (limitation connue, pas un régression)

### Fichiers modifiés (non commités, pas de repo git)
- `apps/frontend/package.json` (bump `lucide-react`, `eslint`)
- `apps/frontend/package-lock.json` (régénéré)
- `apps/frontend/app/globals.css` (réordonnancement `@import`)
- `apps/frontend/tsconfig.json` (auto-update Next 16)
- `apps/frontend/next-env.d.ts` (régénéré)

### Notes
- Workspace non versionné (`git status` → not a git repo). Pas de SHA à fournir.
- Snapshot pré-existant conservé : `_backup/nextjs_bump_16x_2026-05-20_17h52/` (package.json 14.0.4 + next.config.js + lockfile 14.2.33 + 2 fichiers `app/`).
- Le bump majeur de `lucide-react` (0.294 → 0.460) peut introduire des renommages d'icônes ; aucun runtime test fait, mais le build statique compile sans erreur d'import.
- `apps/api` non touché (FastAPI Python probable, pas de Next.js).

### Comparaison avec cupel
- Similaire à `Handler Catcher` (codebase minimaliste, peu de breaking changes Next à corriger)
- Particularité SELFPOD : peer-deps bloquants (`lucide-react` et `eslint`) qu'il a fallu bumper avant d'arriver au build
- Particularité Turbopack (nouveau moteur par défaut en Next 16) : strict sur l'ordre des `@import` CSS, là où webpack/PostCSS toléraient l'ordre inversé en Next 14

### Pas de blocker restant.

## Headers sécu VALIBAN — 2026-05-20
- Statut : OK
- Fichier : apps/frontend/next.config.ts
- SHA : 39324f1
- Build : OK (next build direct, contournement pre-hook pnpm install)
- Headers ajoutés : HSTS (preload, 2 ans), X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy (incl. interest-cohort=())
- Note : augmentation d'un bloc existant (source `/(.*)` au lieu de `/:path*`), pas de CSP (à définir plus tard)
