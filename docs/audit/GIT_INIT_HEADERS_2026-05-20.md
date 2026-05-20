---
title: git init + headers sécu — DropOrch, SELFPOD, Handler Catcher
date: 2026-05-20
auteur: Aïssa BELKOUSSA
---

## Résultat par projet

| Projet | git init | Headers OK | Build | SHA initial | Fichiers tracked |
|---|---|---|---|---|---|
| DropOrch | OK (main) | Ajoutés (5 headers) | Vert (Next 16.2.6 Turbopack) | `dca0635` | 250 |
| SELFPOD | OK (main) | Étendus (3 → 5 headers) | Vert (Next 16.2.6 Turbopack, `output: 'export'`) | `813dd78` | 110 |
| Handler Catcher | OK (main) | Ajoutés (5 headers) | Vert (Next 16.2.6 Turbopack) | `4777d1c` | 135 |

Email git : `contact@aissabelkoussa.fr` — Nom : `Aïssa BELKOUSSA` (par projet, pas global).
Branche par défaut : `main`. Aucun `Co-Authored-By` IA.

## Headers ajoutés

Bloc `async headers()` injecté avec `Strict-Transport-Security` (max-age 2 ans, includeSubDomains, preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`. Pas de CSP (à définir au cas par cas plus tard).

- `/Volumes/Professionnel/Projets/Développement/Concepts/DropOrch/apps/frontend/next.config.js` — bloc ajouté (n'existait pas)
- `/Volumes/Professionnel/Projets/Développement/Concepts/SELFPOD/apps/frontend/next.config.js` — bloc étendu (avait 3/5 headers, manquait HSTS + Permissions-Policy)
- `/Volumes/Professionnel/Projets/Développement/Concepts/Handler Catcher/apps/frontend/next.config.js` — bloc ajouté (n'existait pas)

## Fichiers sensibles écartés du staging

### DropOrch
- `apps/config/development.env` (contenait `POSTGRES_PASSWORD=droporch` en clair) — retiré du staging, ajout règle `*.env` dans `.gitignore` (whitelist `.env.example`).
- `apps/config/production.env` (templates `${POSTGRES_PASSWORD}` sans valeur mais classé .env par prudence) — retiré du staging.
- `node_modules/`, `.next/`, `_backup/`, `logs/`, `.DS_Store`, `.vscode/` ignorés via `.gitignore`.
- Tracked : `apps/config/.env.example` et `apps/packages/shared-types/.env.example` (whitelist OK).

### SELFPOD
- `.gitignore` créé from scratch avec règles globales (`*.env` + whitelist `.env.example`, `_backup/`, `.vercel`, `.turbo`, `node_modules`, `.next`, `out`, `.DS_Store`, `logs/*.log`, `.venv`).
- Aucun fichier `*.env` candidat détecté à la racine ni dans les apps. `logs/` exclu (artefacts runtime).
- Aucun `secrets/`, `*.key`, `*.pem` détecté.

### Handler Catcher
- `.gitignore` créé from scratch (mêmes règles que SELFPOD).
- `tools/scripts/Handler twitter.new Catcher/config/secrets.py` inspecté : module de gestion (`SecretsManager` via keyring), **pas** de valeurs secrètes en clair — tracked OK.
- `.env.example` whitelisté — tracked OK.

## Push restant à faire (Aïssa)

DropOrch :
```bash
cd "/Volumes/Professionnel/Projets/Développement/Concepts/DropOrch"
gh repo create aissablk1/droporch --private --source=. --remote=origin
git push -u origin main
```

SELFPOD :
```bash
cd "/Volumes/Professionnel/Projets/Développement/Concepts/SELFPOD"
gh repo create aissablk1/selfpod --private --source=. --remote=origin
git push -u origin main
```

Handler Catcher (espace dans le nom local — slug remote suggéré) :
```bash
cd "/Volumes/Professionnel/Projets/Développement/Concepts/Handler Catcher"
gh repo create aissablk1/handler-catcher --private --source=. --remote=origin
git push -u origin main
```

Visibilité par défaut : `--private` (CLAUDE.md feedback `repo_visibility`). Aïssa flippera `--public` projet par projet si nécessaire.

## Notes spécifiques

- **SELFPOD** : `output: 'export'` configuré. À l'export statique pur, les headers Next ne sont pas émis (pas de runtime). Ils prennent effet si déploiement sur Vercel/Node ou si l'export est servi derrière un reverse proxy qui les réinjecte. Garder le bloc en place pour le jour où l'app passe en SSR partiel.
- **DropOrch** : `.gitignore` préexistant (200+ lignes, multi-stack JS/Go/Python/Terraform) — complété avec `_backup/`, `.vercel`, `.turbo`, `*.env` + whitelist `.env.example`.
- **Handler Catcher** : dossier `tools/scripts/Handler twitter.new Catcher/` contient des espaces et un point dans le nom — git gère via quoting natif, tracked sans souci. Pas de pollution Mac (`.DS_Store` ignoré, aucun `._*` détecté).
- Builds des 3 projets validés sur Next 16.2.6 Turbopack après ajout des headers — zéro régression.
- Aucun push effectué (consigne stricte).
