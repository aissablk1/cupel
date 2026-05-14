# ADR 0001 — Monorepo pnpm

- Statut : Accepté
- Date : 2026-05-14
- Auteur : Aïssa BELKOUSSA

## Contexte

Forgekit livre 4 artefacts qui partagent des types, des schémas zod et des
utilitaires (split revenue, slug, signature) :

1. `apps/web` — Next.js 15 (front + API publique)
2. `packages/cli` — `@forgekit/cli` (npm public)
3. `packages/sdk` — `@forgekit/sdk` (npm public)
4. `packages/security` — analyse statique + signature Ed25519 (interne)
5. `packages/shared` — types + utils

Options évaluées : multi-repos, Nx, Turborepo + pnpm, pnpm workspaces seul,
Bun workspaces.

## Décision

Monorepo **pnpm workspaces** + **Turborepo** pour l'orchestration cache /
graphe de tâches. Pas de Nx (overhead conceptuel, génériques côté JS),
pas de Bun (encore jeune sur native modules `node-postgres`, `sharp`).

Structure :

```
forgekit/
├── apps/web/
├── packages/{cli,sdk,security,shared}/
├── pnpm-workspace.yaml
├── turbo.json
└── package.json    # root, scripts agrégés
```

Versioning : Changesets, releases manuelles. Pas de versioning auto sur
`shared` (consommé en interne via `workspace:*`).

## Conséquences

**Positives :**

- Type sharing instantané (`@forgekit/shared` exporte `Skill`, `Purchase`)
- Refactor cross-package atomique dans une seule PR
- CI plus rapide avec Turbo cache local + remote (Vercel)
- pnpm strict par défaut (pas de phantom deps)

**Négatives :**

- Onboarding contributeur externe légèrement plus lourd (pnpm + workspaces)
- Risque de couplage `apps/web` <-> `packages/*` si discipline pas tenue —
  mitigation : ESLint `no-restricted-imports` sur imports cross-app
- CI doit gérer le `frozen-lockfile` et le cache pnpm correctement

## Alternatives rejetées

- **Multi-repos** : surcharge de release coordination, types dupliqués
- **Nx** : générique mais alourdit conceptuellement un projet TS pur
- **Bun workspaces** : risque natif (Sharp, node-postgres) en mai 2026

## Références

- pnpm workspaces : https://pnpm.io/workspaces
- Turborepo : https://turbo.build/repo
- Changesets : https://github.com/changesets/changesets
