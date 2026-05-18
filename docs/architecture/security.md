# Architecture Sécurité — Cupel Marketplace

**Auteur** : Aïssa BELKOUSSA

Document de référence pour la couche sécurité de Cupel. Couvre la pipeline de scan, la signature cryptographique des skills, et la distribution des clés publiques.

---

## 1. Pipeline de scan (à l'upload)

Chaque skill uploadé sur la marketplace traverse une pipeline déterministe **avant** publication. Tout verdict `fail` bloque la publication ; un verdict `warn` la signale en review humaine.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Upload zip  │ →  │  Unzip safe  │ →  │  Static scan │ →  │  LLM review  │
│  (signed URL)│    │  (yauzl,     │    │  scanSkill() │    │  (optionnel) │
│              │    │   path-safe) │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                │                    │
                                                ▼                    ▼
                                        ┌──────────────────────────────────┐
                                        │ verdict ∈ {pass, warn, fail}     │
                                        │ + score 0-100 + findings[]       │
                                        └──────────────────────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────┐
                                         │  signManifest (Ed25519) │
                                         │  → stocké dans DB       │
                                         └─────────────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────┐
                                         │  Publication CDN        │
                                         │  cdn.cupel.dev       │
                                         └─────────────────────────┘
```

### 1.1 Unzip safe

`yauzl` est utilisé en mode streaming. Garde-fous :

- Pas de `..` dans les entrées (zip-slip).
- Pas de symlinks ni de hard links (`unixPermissions & 0o120000`).
- Taille décompressée bornée (50 Mo total, 5 Mo par fichier, ratio < 100x).
- Nombre d'entrées plafonné à 5 000.

### 1.2 Static scan (`@cupel/security/scan`)

Trois sous-scanners parallèles sur chaque fichier texte du skill :

| Scanner               | Cible                                                  | Sévérité max |
| --------------------- | ------------------------------------------------------ | ------------ |
| `secrets.ts`          | AWS, Stripe, GitHub, OpenAI, Anthropic, JWT, PEM, etc. | critical     |
| `dangerous-code.ts`   | `eval`, `Function`, `child_process`, `exec`, FS destructif | critical |
| `prompt-injection.ts` | Override system, DAN, jailbreaks FR/EN, base64, zero-width | critical |

Le score global est calculé par `scanSkill()` (cf README package). Un seul finding `critical` suffit pour `fail`.

### 1.3 LLM review (optionnelle)

Pour les verdicts `warn` ou les skills à fort impact (score < 70, > 200 KB, ou plus de 10 fichiers), un appel à Claude Haiku 4.5 (`reviewSkillWithLLM`) ajoute un verdict sémantique. Le résultat est stocké mais ne remplace jamais le verdict statique : il **ajoute** un signal de revue humaine.

---

## 2. Signature des manifests (Ed25519)

### 2.1 Canonicalisation

Le manifest JSON est sérialisé avec **clés triées récursivement** (`canonicalize()` dans `src/sign/index.ts`). Garantie : deux objets égaux structurellement produisent toujours le même hash, indépendamment de l'ordre d'insertion des clés.

### 2.2 Algorithme

- Hash : SHA-256 du JSON canonique (`@noble/hashes`).
- Signature : Ed25519 (`@noble/ed25519`) sur le hash brut.
- Encodage : hex pour `manifest_hash`, `signature`, `public_key`.
- Format de sortie :

```json
{
  "manifest_hash": "<hex sha256>",
  "signature": "<hex ed25519>",
  "public_key": "<hex ed25519 pub>",
  "algorithm": "Ed25519",
  "signed_at": "2026-05-14T10:00:00.000Z"
}
```

### 2.3 Cycle de vie des clés

| Clé                                    | Rôle                                              | Stockage                                  | Rotation        |
| -------------------------------------- | ------------------------------------------------- | ----------------------------------------- | --------------- |
| `cupel-root` (Ed25519)              | Signe la **liste** des clés de publishers actifs  | HSM / Vault (jamais sur serveur web)      | Annuelle        |
| `cupel-publisher-<account_id>`      | Signe les manifests d'un publisher individuel     | Vault server-side, jamais exposée client  | Sur demande     |
| `cupel-ci` (Ed25519)                | Signe les builds CI automatisés                   | GitHub Actions OIDC + Vault dynamic creds | Hebdomadaire    |

La **root key** ne signe **jamais** un manifest directement : elle signe une chaîne `publisher_pubkey → root_pubkey`. Cela permet de révoquer un publisher sans rotation de la root.

---

## 3. Distribution des clés publiques

### 3.1 Trust store côté CLI

Le CLI `cupel` embarque la **root public key** en dur (constante TypeScript, vérifiée au build). Toutes les autres clés publiques sont fetchées dynamiquement via :

```
GET https://api.cupel.dev/v1/keys
```

Réponse signée par la root :

```json
{
  "publishers": [
    { "account_id": "acc_xxx", "pubkey": "<hex>", "revoked": false, "since": "2026-04-01" }
  ],
  "root_signature": "<hex>",
  "issued_at": "2026-05-14T00:00:00Z",
  "expires_at": "2026-05-15T00:00:00Z"
}
```

Le client met en cache pendant 24h max. Toute clé non listée → installation refusée.

### 3.2 Révocation

- **Soft** : flag `revoked: true` dans la liste signée (propagation = TTL du cache, 24h max).
- **Hard** : republication de la root list signée + invalidation CDN immédiate.
- **Catastrophique** (root compromise) : ship d'une nouvelle version CLI avec nouvelle root key embedded.

---

## 4. Vérification côté client (install)

Quand un utilisateur fait `cupel install <skill>` :

1. Fetch tarball + `signed-manifest.json` depuis `cdn.cupel.dev`.
2. Vérifier que `signed.public_key` est dans la trust list (et non révoquée).
3. `verifyManifest(manifest, signed)` → doit renvoyer `true`.
4. Vérifier que chaque fichier du tarball matche un hash listé dans le manifest.
5. Refus immédiat si une étape échoue.

---

## 5. Logging et audit

| Événement          | Destination       | Rétention |
| ------------------ | ----------------- | --------- |
| Upload skill       | Postgres + Loki   | 90 j      |
| Scan verdict       | Postgres          | indéfini  |
| Signature publish  | Postgres          | indéfini  |
| Install (CLI ping) | Anonymisé, Loki   | 30 j      |
| Révocation         | Postgres + alerte | indéfini  |

Voir `docs/observability.md` pour la stack télémétrie.

---

## 6. Références

- STRIDE complet : `docs/architecture/threat-model.md`
- Package code : `packages/security/src/`
- CLI : `packages/security/src/cli.ts`
