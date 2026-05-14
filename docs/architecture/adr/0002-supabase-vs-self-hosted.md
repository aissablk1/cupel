# ADR 0002 — Supabase managed vs Postgres self-hosted

- Statut : Accepté
- Date : 2026-05-14
- Auteur : Aïssa BELKOUSSA

## Contexte

Forgekit a besoin d'une base relationnelle (Postgres), d'auth OAuth
(Google + GitHub), de stockage objet (skills.zip), et d'un runtime serverless
pour les webhooks signés (Lemon Squeezy, Stripe). En phase 0 nous sommes
solo-founder, en EU, sans équipe ops.

Options :

1. Supabase cloud (EU, Frankfurt) — Postgres 16 + Auth + Storage + Edge Functions
2. Self-hosted (Hetzner CX22 + Postgres + MinIO + Keycloak + Caddy)
3. Hybride : Supabase Auth + Postgres managé (Neon, Crunchy) + R2 + Workers

## Décision

**Supabase cloud EU**, plan Pro à $25/mois dès le lancement public.

Justifications :

- RLS Postgres natif = sécurité multi-tenant gérée déclarativement
- Auth OAuth prêt, JWT signé maison, intégration RSC trivial via `@supabase/ssr`
- Edge Functions Deno = runtime serverless EU, idéal pour webhooks signés
- Storage S3-compatible bridé via policies = upload de skills sans backend custom
- Migrations versionnées via Supabase CLI, diff/push, reproductible
- Postgres natif = pas de lock-in propriétaire fort, export `pg_dump` possible

Cloudflare R2 reste utilisé pour les **artefacts publiés / signés** (versions
finales de skills), backups et CDN. Supabase Storage sert les uploads
intermédiaires (avant validation).

## Conséquences

**Positives :**

- Zéro ops jusqu'à >$5k MRR
- Sécurité par défaut (RLS, MFA, rate limit)
- Migrations en code, revues en PR

**Négatives :**

- Coût marginal au-delà du plan Pro (DB compute, egress) — surveiller avec
  alerte spend management
- Edge Functions = Deno seulement, pas Node ; certains packages npm
  incompatibles → contourné via SDK fetch direct
- Lock-in modéré sur policies RLS et Auth → mitigation via export script
  trimestriel + ADR de sortie planifié si MRR >$10k/mois

## Stratégie de sortie

Si croissance impose self-hosted :

1. Postgres EU dédié (Neon ou Hetzner managed)
2. Workers Cloudflare en remplacement des Edge Functions (déjà préparé pour CLI API)
3. Auth → Clerk ou WorkOS (selon volume B2B)

## Références

- Supabase pricing : https://supabase.com/pricing
- RLS guide : https://supabase.com/docs/guides/auth/row-level-security
- Sortie planifiée : voir `docs/architecture/runbooks.md`
