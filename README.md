# Cupel

> Annuaire public gratuit de skills IA + control plane B2B pour équipes dev — Claude Code, Cursor, Codex, Windsurf, Gemini CLI.

**Auteur** : Aïssa BELKOUSSA — contact@aissabelkoussa.fr — aissabelkoussa.fr
**Statut** : Phase 0 — pivot B2B Teams (2026-05-15)
**Licence** : propriétaire, tous droits réservés

## Positionnement

Anthropic publie ses skills gratuitement et GitHub regorge de skills communautaires : vendre un skill à l'unité n'a plus de sens. Cupel capture la valeur là où elle reste : **la gouvernance B2B**. Côté public, tout est gratuit (browse, install CLI, reviews). Côté entreprise, deux plans payants apportent workspace privé, SSO, audit log, allowlist/blocklist, skills internes non publiés, et — sur Enterprise — Confidential Compute, SCIM et SOC 2.

| Plan | Prix | Cible | Cœur de valeur |
|---|---|---|---|
| Public | gratuit | tout dev | browse, install via CLI, reviews |
| Teams | 9 €/seat/mois | 5–50 devs | workspace privé, SSO, audit, allowlist, skills internes |
| Enterprise | 29 €/seat/mois | ≥ 25 seats | SCIM, Confidential Compute, on-prem mirror, SOC 2, custom signing key |

Détails : `docs/specs/pricing.md` et `docs/specs/positioning.md`.

---

## Stack

| Couche | Tech |
|---|---|
| Frontend | Next.js 15 (App Router, RSC), Tailwind CSS 4, shadcn/ui, Framer Motion, react-hook-form, zod, next-intl |
| Backend | Supabase Postgres 16, Auth (Google + GitHub), Storage, Edge Functions (Deno), Cloudflare R2 |
| Paiement | Stripe Billing (subscriptions Teams/Enterprise, seats, proration, factures B2B SEPA + carte + virement) |
| CLI | Node.js 22, commander, ora, chalk, inquirer — npm `cupel` |
| Sécurité | Static analysis + LLM review (Claude Haiku) + signature SHA-256 + manifest signé Ed25519 |
| Monitoring | Sentry, Plausible, Better Stack Logs, Statuspage |

## Structure (monorepo pnpm)

```
cupel/
├── apps/
│   └── web/                # Next.js 15 app
├── packages/
│   ├── cli/                # cupel
│   ├── sdk/                # @cupel/sdk
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
pnpm dev                         # Next.js sur :5309 (port à vie)
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
