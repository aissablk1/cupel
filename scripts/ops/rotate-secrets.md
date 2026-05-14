# Rotate Secrets — Procédure manuelle

> Author : Aïssa BELKOUSSA
> Created : 2026-05-14
> Cadence : tous les 90 jours, ou immédiatement en cas de fuite suspectée.

## Inventaire des secrets

| Secret | Stockage | Surface impactée | Cadence |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + GH Actions | API serveur, migrations | 90 j |
| `SUPABASE_DB_URL` | Vercel + GH Actions | scripts ops, backups | 90 j |
| `LEMONSQUEEZY_API_KEY` | Vercel | server actions checkout | 90 j |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Supabase Vault | Edge Function webhook | 180 j |
| `STRIPE_SECRET_KEY` | Vercel | payouts (phase 2) | 90 j |
| `STRIPE_WEBHOOK_SECRET` | Supabase Vault | Edge Function payouts | 180 j |
| `R2_ACCESS_KEY` / `R2_SECRET_KEY` | GH Actions secrets | backups | 90 j |
| `SIGNING_PRIVATE_KEY` (Ed25519) | 1Password vault | signature skills | 365 j |
| `RESEND_API_KEY` | Vercel | emails transactionnels | 180 j |
| `SENTRY_AUTH_TOKEN` | GH Actions | source maps upload | 365 j |

## Procédure (par secret)

### 1. Préparer

1. Annoncer la rotation dans `docs/sessions/YYYY-MM-DD_rotate-secrets.md`.
2. Vérifier qu'aucun déploiement n'est en cours (`gh run list`).
3. Snapshot Supabase Vault : `pnpm supabase secrets list > _backup/secrets/vault-pre-$(date -u +%F).txt`.

### 2. Générer la nouvelle valeur

| Secret | Commande |
|---|---|
| `LEMONSQUEEZY_API_KEY` | LS dashboard → Settings → API → Create key |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | `openssl rand -hex 32` puis recoller dans LS webhook |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys → Roll |
| `R2_*` | Cloudflare → R2 → Manage API tokens → Create |
| `SIGNING_PRIVATE_KEY` | `pnpm tsx scripts/security/gen-keypair.ts` |
| `RESEND_API_KEY` | Resend dashboard → API Keys → Create |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → Reset |

### 3. Propager

```bash
# Vercel (par env)
vercel env rm LEMONSQUEEZY_API_KEY production
vercel env add LEMONSQUEEZY_API_KEY production

# GitHub Actions
gh secret set R2_SECRET_KEY --body "<new>"

# Supabase Vault (Edge Functions)
pnpm supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET=<new>
```

### 4. Redéployer

```bash
vercel --prod
pnpm supabase functions deploy lemonsqueezy-webhook
```

### 5. Vérifier

```bash
./scripts/ops/healthcheck.sh
# Tester un webhook : pnpm tsx scripts/lemonsqueezy/test-webhook.ts
# Tester un paiement sandbox bout en bout.
```

### 6. Révoquer l'ancienne valeur

Côté provider (LS / Stripe / Cloudflare / Supabase) — **délai 24 h** entre rotation et révocation pour permettre rollback.

### 7. Archiver

- Mettre à jour `CHANGELOG.md` (section Security)
- Loguer dans `_backup/secrets/rotation-log.tsv` :
  ```
  2026-05-14  LEMONSQUEEZY_API_KEY  rotated  Aïssa
  ```

## Cas d'urgence (fuite)

1. **Révoquer immédiatement** (sauter délai 24 h).
2. Générer + propager + redéployer en moins de 15 minutes.
3. Forcer logout global Supabase : `auth.users` update `aud='unauthenticated'` puis `auth.refresh_tokens` truncate.
4. Audit log : `select * from purchases where created_at > now() - interval '24 hours'` — chercher anomalies.
5. Postmortem dans `docs/architecture/runbooks.md`.

## Anti-patterns

- Pas de secrets dans Git, `.env.local`, `.env.example` (placeholders uniquement).
- Pas de secrets en clair dans Slack/email — toujours 1Password share link expirable.
- Pas de réutilisation entre staging et production.
