# Forgekit

> Marketplace de skills IA pour devs pro — Claude Code, Cursor, Codex, Windsurf.

**Auteur** : Aïssa BELKOUSSA — contact@aissabelkoussa.fr — aissabelkoussa.fr
**Statut** : Phase 0 — scaffolding (mai 2026)
**Licence** : propriétaire, tous droits réservés

---

## Stack

| Couche | Tech |
|---|---|
| Frontend | Next.js 15 (App Router, RSC), Tailwind CSS 4, shadcn/ui, Framer Motion, react-hook-form, zod, next-intl |
| Backend | Supabase Postgres 16, Auth (Google + GitHub), Storage, Edge Functions (Deno), Cloudflare R2 |
| Paiement | Lemon Squeezy (MoR EU), Stripe Connect (payouts, phase 2) |
| CLI | Node.js 22, commander, ora, chalk, inquirer — npm `@forgekit/cli` |
| Sécurité | Static analysis + LLM review (Claude Haiku) + signature SHA-256 + manifest signé Ed25519 |
| Monitoring | Sentry, Plausible, Better Stack Logs, Statuspage |

## Structure (monorepo pnpm)

```
forgekit/
├── apps/
│   └── web/                # Next.js 15 app
├── packages/
│   ├── cli/                # @forgekit/cli
│   ├── sdk/                # @forgekit/sdk
│   ├── security/           # static analysis + signing
│   └── shared/             # types + utils
├── supabase/
│   ├── migrations/         # SQL versionnés
│   └── functions/          # Edge Functions Deno
├── docs/
│   ├── sessions/           # journal QQOQCCP (local, gitignored)
│   ├── architecture/       # ADRs + diagrammes
│   └── specs/              # spec functionnelles
├── scripts/                # outils dev locaux
└── _backup/                # backups locaux (gitignored)
```

## Démarrage

```bash
# Prérequis : Node 22+, pnpm 9+, Supabase CLI

pnpm install
cp .env.example .env.local       # remplir
pnpm supabase:start              # Supabase local
pnpm supabase:push               # appliquer migrations
pnpm dev                         # Next.js sur :3000
```

## Commandes utiles

```bash
pnpm dev                 # Next.js dev server
pnpm build               # build production
pnpm typecheck           # vérif TS
pnpm lint                # ESLint
pnpm test                # Vitest
pnpm supabase:types      # générer types DB
pnpm cli:build           # build CLI
pnpm cli:link            # lier CLI globalement (test)
pnpm format              # prettier
```

## Documentation

- `PROJECT.nfo` — fiche d'identité projet
- `DESIGN.md` — direction esthétique (« Editorial Premium ») + tokens
- `docs/architecture/` — ADRs, diagrammes, threat models
- `docs/specs/` — spécifications fonctionnelles
- `docs/sessions/` — journal de bord (local seulement)

## Workflow Git

Sessions parallèles : **jamais** `git add -A`, fichiers explicites uniquement (CLAUDE.md §7).

```bash
git add path/to/file.ts path/to/other.ts
git commit -m "feat(scope): description"
```

## Direction esthétique

**Editorial Premium** — Migra display + Geist body + JetBrains Mono. Palette ivoire/encre + accents terracotta/sage. Pas de gradient purple-blue, pas de Inter. Voir `DESIGN.md` pour détails.

## Sécurité

- Aucune clé secrète côté client (CLAUDE.md §5)
- RLS Supabase activé sur toutes les tables sensibles
- Signature Ed25519 sur chaque skill version
- Scan secrets + eval/exec sur upload
- Review LLM (Claude Haiku) anti-prompt-injection
- CSP strict, Referrer Policy `strict-origin-when-cross-origin`

## Roadmap court terme

Voir `docs/specs/roadmap.md`. Phase 0 → 5 sur 12 mois, MVP public visé mois 3.

---

© 2026 Aïssa BELKOUSSA — Tous droits réservés
