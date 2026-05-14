# @forgekit/cli

> Marketplace de skills IA pour développeurs pros. Install, manage, publish.

CLI officiel de [Forgekit](https://forgekit.dev) — distribue des skills compatibles
Claude Code, Cursor, Codex, Windsurf, Gemini CLI, GitHub Copilot CLI et Continue.

---

## Installation

```bash
npm i -g @forgekit/cli
```

Requiert Node.js ≥ 22.

Vérifier l'installation :

```bash
forgekit --version
forgekit doctor
```

`doctor` détecte les plateformes IDE installées localement et vérifie l'auth.

---

## Authentification

```bash
forgekit login
```

Ouvre le navigateur sur `forgekit.dev/cli-auth` et récupère un token persisté
dans `~/.config/forgekit`. Sans login : recherche et install publics restent
accessibles ; seules les actions auteur (publish, stats) requièrent un token.

```bash
forgekit whoami      # afficher l'utilisateur connecté
forgekit logout      # effacer le token local
```

---

## Installer un skill

```bash
forgekit search <query>
forgekit install <skill-slug>
```

Le CLI détecte automatiquement les plateformes IDE installées et propose la
cible. Forcer une plateforme :

```bash
forgekit install ts-strict --platform claude_code
forgekit install ts-strict --version 1.2.0
```

Vérifications automatiques avant install :

- SHA-256 du zip contre le manifest
- Signature Ed25519 du manifest contre la clé publique épinglée dans le CLI
- Confirmation interactive si le dossier cible existe déjà

Lister et mettre à jour :

```bash
forgekit list
forgekit update              # tous les skills installés
forgekit update <skill>      # un seul
forgekit remove <skill>
```

---

## Publier un skill

```bash
forgekit init mon-skill      # scaffold (SKILL.md, README.md, manifest)
cd mon-skill
# … édite SKILL.md (Usage, Examples, Limitations)
forgekit validate            # vérifs locales (manifest, sécurité, tailles)
forgekit publish
```

`validate` exécute :

- Schéma du manifest (slug, version, plateformes, tags)
- Détection de secrets (clés API, tokens) dans le contenu
- Vérification CVE des dépendances déclarées
- Taille du zip ≤ 5 MB

`publish` upload le zip signé sur le marketplace et incrémente la version.

---

## Configuration

Le CLI stocke sa config dans `~/.config/forgekit/config.json` :

| Clé | Description |
|---|---|
| `token` | JWT d'authentification |
| `apiUrl` | Endpoint API (par défaut `https://api.forgekit.dev`) |
| `telemetryEnabled` | Opt-in télémétrie anonyme (défaut : `false`) |
| `installed` | Map des skills installés et leurs versions |

Override API en local :

```bash
FORGEKIT_API_URL=http://localhost:3000 forgekit search test
```

---

## Sécurité

- **Signature Ed25519** — chaque manifest est signé côté serveur ; clé publique
  épinglée dans le binaire CLI (cf. `src/lib/signature.ts`)
- **SHA-256** — intégrité du zip vérifiée avant extraction
- **Pas d'exécution automatique** — un skill n'est jamais exécuté à l'install,
  uniquement extrait dans `~/.<platform>/skills/<slug>/`
- **Validation pré-publish** — détection de secrets, scan CVE des dépendances

Signaler une vulnérabilité : `security@forgekit.dev`.

---

## Auteur

Aïssa BELKOUSSA  ›  [aissabelkoussa.fr](https://aissabelkoussa.fr)

## Licence

MIT
