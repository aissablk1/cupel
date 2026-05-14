# Roadmap Forgekit — 12 mois

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-14
> Statut : Plan de travail solo-founder, ajusté mensuellement.

## Phase 0 — Scaffolding (M0, mai 2026)

**Objectif** : poser fondations techniques + identité projet.

- Monorepo pnpm + Turborepo opérationnel
- Next.js 15 + Tailwind 4 + shadcn/ui en place
- Supabase EU provisionné, migrations versionnées
- ADRs 0001-0005 publiés
- Direction esthétique « Editorial Premium » figée (Migra + Geist)
- CI lint/test/build vert
- `PROJECT.nfo` + `README.md` + `LICENSE` + `CHANGELOG.md`

**Done when** : `pnpm dev` lance le projet et `pnpm test` passe en CI.

## Phase 1 — MVP privé (M1–M2, juin-juillet 2026)

**Objectif** : 10 skills publiés en interne, paiement réel fonctionnel.

- Schéma DB : `skills`, `skill_versions`, `purchases`, `users`, `subscriptions`
- RLS strict sur toutes les tables sensibles
- Auth GitHub + Google opérationnelle
- Upload skill via dashboard créateur (drag-drop zip)
- Pipeline de validation : static analysis + LLM review (Claude Haiku)
- Signature Ed25519 sur publication
- Integration Lemon Squeezy : checkout + webhook signé HMAC vérifié
- Email transactionnel (Resend) sur achat + access link
- 10 skills seed (les miens) publiés
- Beta privée : 20 testeurs réseau personnel

**Done when** : un acheteur paie 29 €, reçoit accès, télécharge skill via CLI.

## Phase 2 — Lancement public (M3, août 2026)

**Objectif** : MVP public, premiers créateurs externes onboardés.

- Landing publique, SEO `/skills/[slug]`, OG images dynamiques
- `@forgekit/cli` publié sur npm (`npx forgekit install <slug>`)
- Dashboard créateur : analytics ventes, payouts (manuels phase 1)
- Programme « Early creators » : 10 créateurs invités, 0 % fee 3 mois
- Status page Statuspage, monitoring Sentry + Better Stack
- Doc publique `/docs` (Spec, Format SKILL.md, CLI)
- Press kit + 5 articles SEO + Product Hunt launch

**KPI** : 30 skills publiés, 100 ventes, $3k GMV, 500 inscrits.

## Phase 3 — Croissance & payouts (M4–M6, septembre-novembre 2026)

**Objectif** : automatisation payouts + premiers abonnements.

- Stripe Connect Express activé pour créateurs (KYC géré par Stripe)
- Payouts auto le 5 de chaque mois (75 % net créateur)
- Subscriptions (skill packs mensuels) via Lemon Squeezy
- `@forgekit/sdk` (programmatic install in CI/CD)
- Search + filtres avancés (stack, IDE, langue, tag)
- Reviews + ratings (1-5 stars, max 1 review par achat)
- Programme affiliation (créateurs touchent 10 % sur referrals)

**KPI** : 100 skills, 500 ventes/mois, $10k GMV mensuel.

## Phase 4 — Pro features (M7–M9, déc 2026 – fév 2027)

**Objectif** : packaging Teams + premiers contrats B2B.

- Plan Teams (5/20/100 seats) avec SSO via WorkOS
- License keys par seat, révocation côté CLI
- Audit log conformité (qui a installé quoi, quand)
- Factures B2B PO/NET30 (Lemon Squeezy ou Stripe Invoicing)
- API publique read (catalog) + write (créateurs)
- Webhooks marketplace (sur publication / achat) pour intégrations clients
- Skills certifiés « Forgekit Verified » (review humain payée)

**KPI** : 3 clients Teams >50 seats, $25k MRR.

## Phase 5 — Confidential & Enterprise (M10–M12, mars-mai 2027)

**Objectif** : positionnement haut de gamme + plateforme d'écosystème.

- Confidential validation pipeline (AWS Nitro, cf. ADR 0005)
- Transparency log Sigstore Rekor self-hosted EU
- Enterprise SLA + support dédié (Linear shared)
- Marketplace meta : tags compliance (SOC2 ready, GDPR, HIPAA-aware)
- Programme partenaires (Cursor, Codex, Windsurf, Gemini)
- Bilan 12 mois, levée éventuelle ou bootstrap continu

**KPI cible 12M** : $50k MRR, 500 créateurs, 5000 acheteurs.

## Risques transverses

| Risque | Mitigation |
|---|---|
| Concurrence (Anthropic skill hub officiel) | Différenciation par curation + sécurité signée |
| Dépendance Claude Code | SDK agnostique (Cursor, Codex, Gemini supportés) |
| Coût Vercel / Supabase au scale | Alertes spend, ADR sortie planifié |
| Solo-founder bandwidth | Sub-traitance design / RA selon besoin |
| Compliance EU AI Act | ADR 0005 + suivi DGFIP, audit annuel |
