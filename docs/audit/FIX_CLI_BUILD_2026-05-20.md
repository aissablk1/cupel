---
title: Fix @cupel/shared resolution in CLI build
date: 2026-05-20
auteur: Aïssa BELKOUSSA
---

## Diagnostic

Le build `pnpm --filter @aissabelkoussa/cupel build` échouait sur `ESBuild [ERROR] Could not resolve "@cupel/shared"` dans `src/commands/doctor.ts:10` (et 3 autres imports : `lib/platforms.ts`, `commands/secondary.ts`, `commands/install.ts`).

Cause racine : `packages/cli/package.json` n'avait `@cupel/shared` **ni en `dependencies` ni en `devDependencies`**, alors que tous les autres packages du monorepo (`packages/sdk`, `packages/security`, `apps/web`) le déclarent en `"@cupel/shared": "workspace:*"`. Sans cette déclaration, pnpm ne crée pas de symlink dans `packages/cli/node_modules/@cupel/shared`, donc esbuild (utilisé par tsup) ne peut pas résoudre le module — y compris quand `noExternal: ['@cupel/shared']` est demandé dans `tsup.config.ts`.

La config tsup était correcte (`noExternal` = bonne stratégie car `@cupel/shared` est `"private": true` et ne peut pas être publié sur npm, donc DOIT être inliné dans le bundle distribué). Seule la déclaration côté `package.json` du CLI manquait.

## Solution appliquée

**Solution C (inliner, déjà demandée par tsup) — complétée par déclaration workspace manquante.**

Ajout d'une seule ligne dans `packages/cli/package.json`, section `devDependencies` (pas `dependencies` : le code est inliné par tsup dans `dist/index.js`, donc rien à installer chez l'utilisateur final npm) :

```diff
   "devDependencies": {
+    "@cupel/shared": "workspace:*",
     "@types/inquirer": "^9.0.7",
```

Puis `pnpm install --no-frozen-lockfile` pour créer le symlink workspace dans `node_modules/`.

`tsup.config.ts` non modifié (la config `noExternal: ['@cupel/shared']` était déjà correcte).

## Validation

- `pnpm --filter @aissabelkoussa/cupel build` : **OK** (33.24 KB ESM en 29 ms, shared bien inliné)
- `pnpm --filter web build` : **OK** (régression check, build Next.js complet passe)
- Smoke test CLI : **OK** — `node packages/cli/bin/cupel.mjs --help` affiche correctement l'usage (commander v12 chargé, exports `PLATFORM_LABELS` de shared accessibles)
- Symlink workspace présent : `packages/cli/node_modules/@cupel/shared` -> `../../shared`

## Commit

`5f47e2e` — `fix(cli): declare @cupel/shared as workspace devDep`

Trois fichiers commits : `packages/cli/package.json`, `pnpm-lock.yaml` (mise à jour automatique du resolver). Snapshot préservé dans `_backup/fix_cli_build_2026-05-20_19h00/`.

## TODO résiduel

Aucun. Le fix est minimal (1 ligne), aligne le CLI sur la convention déjà adoptée par les 3 autres consommateurs de `@cupel/shared` dans le monorepo, et préserve le contrat npm (shared reste inliné, pas exposé en dépendance externe à l'utilisateur final).
