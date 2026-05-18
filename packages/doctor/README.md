# @cupel/doctor

Audit local des skills IA — détecte les patterns dangereux dans vos skills installés.

## Usage

```bash
npx @cupel/doctor
npx @cupel/doctor --path ./monrepo
npx @cupel/doctor --json
npx @cupel/doctor --strict
npx @cupel/doctor --verbose
```

Aucune installation, aucune configuration. Exécution immédiate.

## Ce qu’il détecte

- Shell pipé vers un interpréteur (`curl … | bash`, `wget … | sh`)
- `rm -rf` ciblant la racine ou le `$HOME`
- `eval(atob(…))` et autres exécutions de chaînes encodées
- Webhooks d’exfiltration (Discord, Telegram, ngrok, requestbin…)
- Dump d’environnement (`printenv`, `env > …`)
- Clés littérales en clair (AWS, OpenAI, GitHub, Anthropic)
- Blobs base64 longs (charge utile dissimulée)

## Compatibilité

Scan automatique de :

- Claude Code (`~/.claude/skills/`)
- Cursor (`~/.cursor/rules/`)
- Codex (`~/.codex/`)
- Windsurf (`~/.windsurf/`)
- Gemini CLI (`~/.gemini/`)
- Continue (`~/.continue/`)
- Workspace courant (`./.claude/`, `./.cursor/`)

## Privacy

100 % local, aucune télémétrie, aucun appel réseau. Le binaire lit les fichiers sur disque, exécute les règles, affiche le résultat. Rien ne sort de votre machine.

---

**Auteur** : Aïssa BELKOUSSA — [cupel.dev](https://cupel.dev)
**Licence** : MIT
