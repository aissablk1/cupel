# Spec — API REST publique

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-14
> Base URL : `https://api.cupel.dev/v1`
> Auth : Bearer token (PAT généré dans dashboard, scope `read` ou `write`)
> Format : JSON, encoding UTF-8
> Versionning : URL path (`/v1`), deprecation 6 mois avant retrait

## Auth

```
Authorization: Bearer fk_<env>_<random>
```

- `fk_live_…` production
- `fk_test_…` sandbox

Tokens en clair non stockés (hash SHA-256 en DB), affichés une seule fois à
la création.

## Rate limits

| Plan | Read | Write |
|---|---|---|
| Anonymous | 60 / min | — |
| Authenticated | 600 / min | 60 / min |
| Teams | 6000 / min | 600 / min |

Headers : `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## Endpoints

### Catalog

#### `GET /skills`

List paginated.

Query :
- `q` (string) — full-text search
- `tag` (string, repeatable)
- `ide` (enum, repeatable) : `claude-code`, `cursor`, `codex`, `windsurf`, `gemini-cli`
- `sort` : `popular` (default), `recent`, `price_asc`, `price_desc`
- `page` (int, default 1), `per_page` (int, max 100, default 20)

Réponse :

```json
{
  "data": [
    {
      "slug": "my-skill",
      "name": "My Skill",
      "description": "…",
      "author": { "handle": "aissa", "name": "Aïssa BELKOUSSA" },
      "price_cents": 2900,
      "currency": "EUR",
      "tags": ["frontend"],
      "ide_targets": ["claude-code"],
      "version": "1.2.0",
      "downloads": 240,
      "rating": 4.7,
      "rating_count": 38,
      "created_at": "2026-05-14T10:30:00Z",
      "updated_at": "2026-05-20T09:00:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 137 }
}
```

#### `GET /skills/:slug`

Détail d'un skill (toutes versions publiées).

#### `GET /skills/:slug/versions/:version`

Métadonnées d'une version spécifique, incluant `download_url` signé
(15 min TTL) **uniquement si** le caller a une `purchases` row valide.

### Account

#### `GET /me`

Profil du token holder.

#### `GET /me/library`

Liste des skills auxquels l'utilisateur a accès (purchases + subscriptions).

```json
{
  "data": [
    {
      "skill_slug": "my-skill",
      "version": "1.2.0",
      "acquired_at": "2026-05-14T10:30:00Z",
      "access_type": "purchase",
      "expires_at": null
    }
  ]
}
```

### Creator (scope `write`)

#### `POST /skills`

Crée un skill draft.

```json
{
  "name": "My Skill",
  "slug": "my-skill",
  "description": "…",
  "price_cents": 2900,
  "tags": ["frontend"],
  "ide_targets": ["claude-code"]
}
```

#### `POST /skills/:slug/versions`

Upload une version (multipart `file` = skill.zip).

Réponse `202` :

```json
{
  "version_id": "uuid",
  "status": "pending_validation",
  "validation_eta_seconds": 60
}
```

Pipeline : voir `docs/specs/skill-spec.md` §Pipeline de validation.

#### `GET /skills/:slug/versions/:version/validation`

Statut de validation : `pending` → `passed` / `failed` (avec `reasons[]`).

### Webhooks (sortants)

Cupel envoie des webhooks aux URLs configurées dans le dashboard :

- `skill.published` — nouvelle version publiée
- `purchase.created` — un achat a été enregistré
- `purchase.refunded`
- `subscription.created` / `updated` / `cancelled`

Signature : `X-Cupel-Signature: t=<unix>,v1=<hmac-sha256>` (compatible
Stripe-style). Tolérance ±5 min.

## Erreurs

Format Problem Details RFC 9457 :

```json
{
  "type": "https://cupel.dev/errors/rate-limited",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Limit 60/min on endpoint /v1/skills",
  "instance": "req_01H…"
}
```

Codes :

| HTTP | Type |
|---|---|
| 400 | validation-error |
| 401 | unauthenticated |
| 403 | forbidden |
| 404 | not-found |
| 409 | conflict |
| 422 | unprocessable |
| 429 | rate-limited |
| 500 | internal |
| 503 | unavailable |

## Idempotency

Endpoints `POST` write acceptent `Idempotency-Key: <uuid>`. La même clé sur
24 h renvoie la réponse mise en cache (status + body identiques).

## CORS

Pas de CORS depuis browsers en `v1` (server-to-server only). Le front
Cupel utilise des Server Actions / Route Handlers Next.js qui parlent au
même backend en interne.

## Deprecation

Annoncée 6 mois avant retrait via :

- Header `Sunset: <RFC1123 date>`
- Email aux propriétaires de PAT actifs sur l'endpoint
- Entrée `CHANGELOG.md` section `Deprecated`
