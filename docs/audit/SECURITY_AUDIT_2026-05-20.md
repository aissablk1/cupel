---
title: Audit sécurité global — 20 mai 2026
auteur: Aïssa BELKOUSSA
date: 2026-05-20
scope: /Volumes/Professionnel/Projets/Développement/
projets_scannes: 27 racines / 168 manifests applicatifs (hors MCP)
methode: scan statique (lecture manifests + grep code + git ls-files + .gitignore)
---

## TL;DR

État global plutôt sain : aucun secret hardcodé en clair (sk_live_, JWT Supabase, AWS), aucun `NEXT_PUBLIC_*SECRET*` exposé, aucune utilisation de `service_role` côté client. Le seul `.env` versionné est un placeholder VITE_API_URL non sensible dans un repo privé. Trois fronts d'action prioritaires : (1) **6 projets Next.js sont pré-wave 06/05/2026** (cupel/web, VIRGA, VALIBAN, DropOrch, SELFPOD, Handler Catcher) — upgrade obligatoire ; (2) **7 projets sans .gitignore** couvrant `.env` (deviendront P0 dès `git init`) ; (3) **clé Google Maps hardcodée** dans ALBI RP (repo privé pour l'instant, à révoquer par hygiène).

## Tableau récap

Légende headers : OUI = CSP + HSTS + Referrer + X-CTO présents ; PART. = sous-ensemble ; NON = aucun.

| Projet | Stack | CVE critiques | Secrets risque | Headers | Action prio |
|---|---|---|---|---|---|
| cupel/apps/web | Next.js 15.0.0 | **P0** wave 13 CVE | Bas (env OK, service_role serveur-only) | OUI | Upgrade Next ≥ 15.5.18 |
| cca-f-monetisation/code/speckit | Next.js ^16.2.3 | P2 si lockfile < 16.2.6 | Bas | OUI | Vérifier lockfile pin |
| Personnels/malilou | Next.js 16.2.6 | RAS | Bas | **NON** | Ajouter security headers |
| VARP/frontend (Vite + Workers) | React 19, axios 1.14 | RAS | **`.env.production` tracké** (placeholder VITE_API_URL, non secret) repo privé | n/a Vite | Retirer `.env.production` du tracking par hygiène |
| remparq/apps/web | Next.js ^15.5.5 | P1 si lockfile < 15.5.18 | Bas | NON | Pin + headers |
| VIRGA/apps/web | Next.js ^15.5.4 | **P0** wave 13 CVE | Bas | OUI | Upgrade ≥ 15.5.18 |
| VALIBAN/apps/frontend | Next.js 16.2.2 | **P0** wave 13 CVE | Bas (pas de .gitignore racine) | OUI | Upgrade ≥ 16.2.6 + .gitignore |
| SMART Conseil & Performance/frontend | Next.js 16.2.6 | RAS | Bas (pas de .gitignore racine) | **NON** | .gitignore + headers |
| DropOrch/apps/frontend | Next.js 16.2.2 | **P0** wave 13 CVE | Bas | NON | Upgrade ≥ 16.2.6 + headers |
| SELFPOD/apps/frontend | Next.js ^14.0.4 | **P0** wave 13 CVE + branche 14 EOL | Bas (pas de .gitignore racine) | OUI | Upgrade ≥ 15.5.18 |
| Handler Catcher/apps/frontend | Next.js ^14.2.0 | **P0** wave 13 CVE | Bas (pas de .gitignore racine) | NON | Upgrade + .gitignore + headers |
| amineradi/apps/frontend | Next.js ^15.0.3 | P1 si lockfile < 15.5.18 | Bas | OUI | Pin Next ^15.5.18 |
| ULTIEASM/frontend | Next.js ^15.5.18 | RAS | Bas (lodash ^4.17.0 prototype pollution prov.) | NON | Headers + bump lodash ^4.17.21 |
| MAILLON/web | Next.js ^15.5.18 | RAS | Bas | OUI | RAS |
| MANTRAGRID/apps/frontend + backend | React 18 + Fastify ^4.25 | P2 fastify 4 (EOL approchant) | Bas (pas de .gitignore racine) | n/a | .gitignore + plan migration Fastify 5 |
| ROYALEAI/apps/* | React 18 + Fastify ^4.24 + axios 1.14 | P2 fastify 4 | Bas (`.gitignore` ne couvre PAS `.env`) | n/a | Compléter .gitignore (.env*) |
| The Reality Check/apps/* | mixte (Express + Next ?) | n/c | Bas (`.gitignore` ne couvre PAS `.env`) | n/c | Compléter .gitignore |
| ParleCitoyen/apps/* | Next.js (à confirmer) | n/c | OK | n/c | RAS structurel |
| ALBI RP/game | Python (Blender) | n/a | **P1 clé Google Maps hardcodée** dans `game/assets/Blender/import_3dtiles.py:9` (repo privé) | n/a | Révoquer la clé + déplacer en env |
| TEGRAMWARD/apps/* | Vite + React 19 + Python | RAS | Bas | n/a | RAS |
| Plugins/Universo | Next.js (à confirmer) | n/c | Bas | **NON** | Investiguer |
| OmniCrawler/apps/* | NestJS 10 + Meilisearch | RAS | Bas | n/a | RAS |
| Forks/liquidgl-react, pixel-agents-* | démos React | n/a | n/a | n/a | hors scope (forks) |
| 72h, MAILLON/apps/desktop, DoGoAct, etc. | Vite/Tauri/React | RAS surface | Bas | n/a | RAS |
| Portfolio (`CRÉATIVE AÏSSA/Site web/Serveur`) | Eleventy 3 statique | RAS | n/a | dépend du host | hors scope strict (volume séparé) |

Manifests vides (ne déclarent rien d'applicatif) : Clicker/apps, CashPilot/apps, clickerdopamine/apps, MYRALERT/apps/config, TRRRACK/{frontend,backend}, ALBI RP/{web,bot} (workspace shells uniquement).

## Détails par projet

### cupel/apps/web (P0)
- **Finding** : `next` épinglé à `15.0.0` strict, antérieur à la wave 13 CVE Next du 06/05/2026 (corrigée 15.5.18 / 16.2.6).
- **Fichier** : `apps/web/package.json:33`
- **Sévérité** : P0
- **Fix** : `pnpm --filter web add next@^15.5.18 eslint-config-next@^15.5.18` puis `pnpm install` ; régénérer `pnpm-lock.yaml`.
- **Note** : CSP/HSTS/X-CTO/Referrer-Policy déjà en place dans `apps/web/next.config.ts` — bon niveau de base.

### VIRGA/apps/web (P0)
- **Finding** : `next ^15.5.4` accepte 15.5.4 à 15.x ; si lockfile bloque sur 15.5.4-15.5.17 → vulnérable.
- **Fichier** : `apps/web/package.json` (ligne next)
- **Sévérité** : P0
- **Fix** : bumper la borne basse à `^15.5.18` + `pnpm install` ; vérifier `pnpm-lock.yaml`.

### VALIBAN/apps/frontend (P0)
- **Finding** : `next 16.2.2` strict, pré-16.2.6 ; en plus **aucun `.gitignore` racine** → `.env.local` non protégé en cas de `git init`.
- **Fichier** : `apps/frontend/package.json`
- **Sévérité** : P0 (CVE) + P1 (gitignore)
- **Fix** : `npm install next@^16.2.6` ; créer `.gitignore` racine avec block `.env*` (sauf `.env.example`).

### DropOrch/apps/frontend (P0)
- **Finding** : `next 16.2.2` strict, pré-16.2.6.
- **Fichier** : `apps/frontend/package.json`
- **Sévérité** : P0
- **Fix** : bump `next@^16.2.6`.

### SELFPOD/apps/frontend (P0)
- **Finding** : `next ^14.0.4` — branche 14 plus maintenue, wave 06/05/2026 a patchés via backport limités. Migration nécessaire.
- **Fichier** : `apps/frontend/package.json`
- **Sévérité** : P0
- **Fix** : migrer vers `next@^15.5.18` (breaking minor, vérifier App Router) ; régénérer lockfile.

### Handler Catcher/apps/frontend (P0)
- **Finding** : `next ^14.2.0` — même problématique branche 14.
- **Sévérité** : P0
- **Fix** : migrer vers `next@^15.5.18` ; ajouter `.gitignore` racine ; ajouter headers de sécurité dans `next.config.js`.

### amineradi/apps/frontend (P1)
- **Finding** : `next ^15.0.3` — caret accepte 15.5.x donc fix possible via `pnpm update`. À vérifier lockfile.
- **Sévérité** : P1
- **Fix** : `pnpm update next eslint-config-next` puis vérifier `pnpm-lock.yaml` cible ≥ 15.5.18.

### remparq/apps/web (P1)
- **Finding** : `next ^15.5.5`. Caret OK, mais à confirmer côté lockfile (pas de lockfile remonté à la racine, repo non `git init`).
- **Sévérité** : P1
- **Fix** : `pnpm update next` ; ajouter headers de sécurité (CSP+HSTS+X-CTO) dans `next.config.ts`.

### cca-f-monetisation/code/speckit (P2)
- **Finding** : `next ^16.2.3` ; caret accepte 16.2.6, à confirmer via lockfile.
- **Sévérité** : P2 (probablement résolu côté lockfile)
- **Fix** : `pnpm install` après `pnpm update next`.

### ALBI RP/game (P1 — privé donc dégradé)
- **Finding** : clé Google Maps API hardcodée.
- **Fichier** : `game/assets/Blender/import_3dtiles.py:9`
- **Sévérité** : P1 (repo `aissablk1/ALBIRP` PRIVÉ confirmé via `gh repo view`)
- **Fix** : 1) révoquer la clé sur Google Cloud Console ; 2) déplacer vers `os.environ.get("GOOGLE_MAPS_API_KEY")` ; 3) ajouter `.env` au .gitignore racine (déjà couvert) ; 4) `git filter-repo` ou BFG si on veut purger l'historique (optionnel tant que privé).

### VARP/apps/frontend (P2)
- **Finding** : `.env.production` est tracké dans le repo (`https://github.com/VARPHQ/varp.git`, privé). Contenu vérifié : 1 seule clé `VITE_API_URL` placeholder commentée — non sensible.
- **Fichier** : `apps/frontend/.env.production`
- **Sévérité** : P2 (par hygiène, pas par fuite)
- **Fix** : `git rm --cached apps/frontend/.env.production` ; ajouter `.env*` au `.gitignore` (déjà présent au niveau racine pour `.env`, `.env.local`, etc. — mais pas `.env.production`).

### Personnels/malilou (P2)
- **Finding** : `next.config.ts` ne définit aucun header de sécurité. Projet déployé Vercel public (cadeau Lilou).
- **Fichier** : `next.config.ts`
- **Sévérité** : P2 (faible surface, mais public)
- **Fix** : ajouter `async headers()` avec Referrer-Policy, X-Content-Type-Options, X-Frame-Options DENY, Permissions-Policy.

### Projets sans `.gitignore` racine (P1 latent)
- **Projets** : VALIBAN, SELFPOD, Handler Catcher, MANTRAGRID, SMART Conseil & Performance, The Reality Check (ce dernier a un .gitignore mais ne couvre pas `.env`), ROYALEAI (idem).
- **Statut actuel** : aucun n'a `git init` (aucun `.git/`) → **pas de fuite effective**.
- **Sévérité** : P1 latent (devient P0 dès le premier `git init && git add .`).
- **Fix** : créer un `.gitignore` racine standard (template Next/Node) avant tout `git init`, incluant a minima : `node_modules/`, `.next/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `.turbo/`, `coverage/`.

### Lodash hérité (P2)
- **Projet** : ULTIEASM/frontend déclare `lodash ^4.17.0` (CVE-2020-8203 prototype pollution corrigée en 4.17.21).
- **Fix** : `npm install lodash@^4.17.21` ou retirer si non utilisé.

### cupel test fixture (P2 cosmétique)
- **Fichier** : `packages/cli/test/doctor.test.ts:69` — chaîne `AKIAIOSFODNN7ABCDEFGH` détectée par grep. C'est la **clé d'exemple AWS officielle** (pas un vrai secret).
- **Sévérité** : P2 cosmétique
- **Fix** : remplacer par `AKIA_FIXTURE_FAKE_KEY_FOR_TESTS` pour éviter le bruit des futurs scans.

## Recommandations globales (5)

1. **Wave Next.js 06/05/2026 — finir le patch.** 6 projets identifiés P0/P1 (cupel/web, VIRGA, VALIBAN, DropOrch, SELFPOD, Handler Catcher). Lancer une session dédiée 2-3h, batcher les bumps + lockfile + smoke test build. ROI sécu maximal, effort < 1 jour total.

2. **Template `.gitignore` partagé.** 7 projets sans gitignore correct attendent un `git init` pour transformer le placeholder `.env` en P0 effectif. Créer `~/.claude/templates/gitignore-node.template` et l'ajouter via un hook PostToolUse sur `git init`, ou via script `scripts/init-gitignore.sh` à exécuter dans tout nouveau projet.

3. **Headers de sécurité par défaut pour toute app Next.js.** 6 projets Next ont `next.config` sans bloc `headers()` (malilou, remparq, SMART CP, DropOrch, Handler Catcher, ULTIEASM). Créer un snippet réutilisable (CSP+HSTS+X-CTO+X-Frame-Options+Referrer-Policy+Permissions-Policy) — la version `cupel/apps/web/next.config.ts` est un excellent point de départ.

4. **Révocation préventive de la clé Google Maps `***REVOKED-2026-05-22***`** dans Google Cloud Console, indépendamment du fait que ALBI RP soit privé aujourd'hui. Coût : 5 minutes. Bénéfice : tranquillité si le repo flippe public.

5. **Pipeline `cve-analyzer` mensuel.** Aïssa a déjà le skill `cve-analyzer` installé. L'exécuter en routine mensuelle sur les 8-10 projets actifs (cupel, malilou, cca-f-monetisation, VARP, remparq, MAILLON, VIRGA, SMART CP) éviterait de redécouvrir une wave CVE deux semaines après. À planifier via `CronCreate` ou rappel récurrent.

---

**Synthèse chiffrée** : 6 findings **P0** (CVE Next.js), 4 findings **P1** (clé Google Maps + gitignore manquants potentiels + amineradi/remparq à confirmer lockfile), 5 findings **P2** (headers, lodash, cosmétique). Aucun secret réel exposé dans un repo public.

**Auteur** : Aïssa BELKOUSSA
