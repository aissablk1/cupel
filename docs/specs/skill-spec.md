# Spec — Format SKILL.md, manifest et signature

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-14
> Version : 0.1.0

## Vue d'ensemble

Un skill Cupel est une **archive ZIP** contenant :

```
my-skill/
├── SKILL.md              # OBLIGATOIRE — instructions principales
├── manifest.json         # OBLIGATOIRE — métadonnées + checksums
├── manifest.sig          # OBLIGATOIRE (post-validation) — signature Ed25519
├── README.md             # recommandé — vitrine humaine
├── LICENSE               # recommandé
├── resources/            # optionnel — assets référencés depuis SKILL.md
│   ├── prompts/
│   ├── templates/
│   └── examples/
└── scripts/              # optionnel — scripts utilitaires (jamais auto-exécutés)
```

## `SKILL.md` — format

```markdown
---
name: my-awesome-skill
version: 1.2.0
description: One-liner < 200 chars.
author: Display Name
author_email: optional@example.com
license: MIT
tags: [frontend, react, design]
ide_targets: [claude-code, cursor, codex, windsurf, gemini-cli]
language: en
cupel_spec: 0.1.0
---

# My Awesome Skill

> When to trigger: <description triggers>

## Instructions

…
```

### Frontmatter — champs

| Champ | Type | Requis | Notes |
|---|---|---|---|
| `name` | string | yes | kebab-case, 3–60 chars, unique sur Cupel |
| `version` | semver | yes | `MAJOR.MINOR.PATCH` strict |
| `description` | string | yes | 20–200 chars |
| `author` | string | yes | nom d'affichage |
| `author_email` | email | no | masqué côté public |
| `license` | SPDX | yes | identifiant SPDX ou `Proprietary` |
| `tags` | string[] | yes | 1–8 tags, kebab-case |
| `ide_targets` | enum[] | yes | au moins 1 cible |
| `language` | ISO 639-1 | yes | `en`, `fr`, etc. |
| `cupel_spec` | semver | yes | version de cette spec |

## `manifest.json` — format

```json
{
  "spec": "0.1.0",
  "name": "my-awesome-skill",
  "version": "1.2.0",
  "created_at": "2026-05-14T10:30:00Z",
  "files": [
    {
      "path": "SKILL.md",
      "sha256": "a3b…",
      "size": 4821
    },
    {
      "path": "resources/prompts/main.md",
      "sha256": "8f2…",
      "size": 1240
    }
  ],
  "manifest_sha256": "computed-over-files-array-sorted-by-path"
}
```

Tous les fichiers de l'archive doivent être listés dans `files` (sauf
`manifest.json` et `manifest.sig`). Hash : SHA-256 hex lowercase.

## Signature

Cupel signe `manifest.json` **après** validation (static analysis +
LLM review). Le fichier `manifest.sig` contient :

```
Ed25519 raw signature (64 octets) — base64url, no padding
```

Vérification côté CLI :

```ts
const ok = crypto.verify(
  null,
  manifestBytes,
  cupelPubkey,
  signatureBytes,
);
```

Clé publique : embarquée dans `cupel`, ET disponible sur
`https://cupel.dev/.well-known/cupel-pubkey` (rotation cf. ADR 0004).

## Pipeline de validation (côté Cupel)

À la publication d'une version :

1. **Unzip** dans sandbox éphémère (rootless container, no network)
2. **Static analysis** (`packages/security/static.ts`) :
   - Pas d'`eval`, `Function()`, `exec`, `spawn` dans le markdown
   - Pas de secrets détectés (gitleaks rules)
   - Pas d'URLs en blacklist (PBN, infostealer feeds)
   - Pas de binaires (>100 KB sauf images whitelist)
3. **LLM review** (Claude Haiku 4.5) :
   - Détection prompt injection (instructions cachées, jailbreak)
   - Vérification cohérence frontmatter ↔ contenu
   - Score 0–100 ; <70 = rejet, 70–84 = review humaine, ≥85 = auto-pass
4. **Manifest computation** : SHA-256 par fichier, `manifest_sha256` global
5. **Sign** : Ed25519 sign avec clé privée Cupel, écrit `manifest.sig`
6. **Upload R2** : `skills/{slug}/{version}/skill.zip` (immutable)
7. **DB update** : `skill_versions` row `status=published`

## Versioning

- SemVer strict
- Pas de version `0.x.y` pour skills publiés payants (signal de non-stabilité)
- Major bump = breaking change documenté dans `## Changelog` du SKILL.md
- Yank possible (status=yanked) sans suppression du R2 (audit)

## Installation côté utilisateur

```bash
npx @aissabelkoussa/cupel install my-awesome-skill@1.2.0
# - download skill.zip + manifest.sig
# - verify Ed25519 signature contre pubkey embarquée
# - verify SHA-256 chaque fichier
# - extract vers ~/.claude/skills/my-awesome-skill/ (ou cible IDE)
```

Échec de vérification = abort + log local, jamais d'install partielle.

## Compatibilité ascendante

`cupel_spec` permet d'évoluer la spec sans casser le CLI. Le CLI supporte
les 2 versions majeures les plus récentes (N et N-1).
