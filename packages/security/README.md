# @cupel/security

Couche sécurité de la marketplace Cupel : scan statique des skills uploadés, signature Ed25519 des manifests, audit LLM optionnel.

**Auteur** : Aïssa BELKOUSSA

## Pourquoi

Cupel distribue des **skills IA exécutés par des agents** (Claude Code, Cursor, Codex). Un skill est une boîte contenant du Markdown, du code, des assets. Trois classes de menace dominent :

1. **Fuite de secrets** dans le code uploadé (AWS, Stripe, OpenAI, JWT, PEM, DB URLs).
2. **Code dangereux** côté runtime (`eval`, `Function`, `child_process`, `exec`, FS destructif).
3. **Prompt-injection** dans les instructions textuelles (override system prompt, DAN, jailbreaks FR/EN, obfuscation base64 / zero-width).

Le package fournit la pipeline de scan + la signature cryptographique des manifests + un hook LLM optionnel pour les cas ambigus.

## Surface publique

```ts
import { scanSkill } from '@cupel/security/scan';
import { signManifest, verifyManifest } from '@cupel/security/sign';
import { reviewSkillWithLLM } from '@cupel/security/llm';
```

### `scanSkill({ files })`

Renvoie `{ verdict: 'pass' | 'warn' | 'fail', score, counts, secrets[], dangers[], injections[] }`.

Score 100 = parfait. Pénalités : `-25` par critical, `-10` par high, `-3` par medium, `-1` par low. `critical > 0` → `fail`.

### `signManifest(manifest, privKeyHex)` / `verifyManifest(manifest, signed)`

Signature Ed25519 (`@noble/ed25519`) sur le hash SHA-256 du manifest canonicalisé (clés triées). Renvoie `{ manifest_hash, signature, public_key, algorithm: 'Ed25519', signed_at }`.

### `reviewSkillWithLLM(content)`

Audit Haiku 4.5 du contenu d'un skill. Nécessite `ANTHROPIC_API_KEY`. Sortie JSON `{ verdict, confidence, findings[], summary }`.

## CLI

```bash
cupel-security scan ./my-skill           # scan répertoire ou fichier
cupel-security scan ./skill.md --json    # sortie JSON pour CI
cupel-security scan ./pkg --fail-on=warn # exit 2 sur warn
```

Exit codes : `0=pass`, `1=fail`, `2=warn` (si `--fail-on=warn`), `3=erreur invocation`.

## Threat model (synthèse)

| Surface              | Menace principale              | Contre-mesure                                 |
| -------------------- | ------------------------------ | --------------------------------------------- |
| Upload skill         | Code malicieux, secrets, injection | `scanSkill` bloquant si verdict=fail        |
| Distribution         | MITM, tampering du manifest    | `signManifest` Ed25519 + clé publique pinée   |
| Exécution côté agent | Prompt-injection cachée        | `scanContentForPromptInjection` + revue LLM   |
| Marketplace API      | Spoofing auteur                | Compte vérifié + signature liée au compte     |

Détail STRIDE complet : `docs/architecture/threat-model.md`. Pipeline et distribution des clés publiques : `docs/architecture/security.md`.

## Tests

```bash
pnpm --filter @cupel/security test
pnpm --filter @cupel/security typecheck
```

Fixtures dans `test/fixtures/` :

- `safe-skill/` — skill propre, doit passer.
- `malicious-skill/` — injection prompt, doit fail.
- `leaking-skill/` — secret AWS hardcodé (fake), doit fail.

## License

MIT
