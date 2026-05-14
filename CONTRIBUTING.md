# Contribuer à Forgekit

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-14

Merci de l'intérêt pour Forgekit. Ce document couvre **deux flux** :

1. Contribuer un **skill** au marketplace
2. Contribuer au **code source** de la plateforme (rare en phase 0–2, repo privé)

---

## 1. Contribuer un skill

### Prérequis

- Compte Forgekit (auth via GitHub ou Google)
- Node 22+ et `npx` disponibles
- Un éditeur de Markdown préféré

### Étapes

1. **Initialiser**

   ```bash
   npx @forgekit/cli init my-awesome-skill
   ```

   Génère un dossier conforme à `docs/specs/skill-spec.md`.

2. **Rédiger `SKILL.md`**

   Frontmatter complet (voir spec). Le corps décrit :
   - **When to trigger** : conditions claires pour l'IA
   - **Instructions** : marche à suivre
   - **Examples** : entrées-sorties attendues

3. **Tester localement**

   ```bash
   npx @forgekit/cli validate ./my-awesome-skill
   ```

   Vérifie : frontmatter, hashes, absence d'`eval`/`exec`, secrets, etc.

4. **Soumettre**

   ```bash
   npx @forgekit/cli publish ./my-awesome-skill
   ```

   Upload vers Forgekit, déclenche le pipeline de validation. Délai
   typique : 60 secondes.

5. **Suivre la validation**

   Dashboard → My skills → Validation status. Si rejet : reasons détaillées,
   correction puis `forgekit publish` à nouveau (version bumped).

### Guidelines de qualité

- **Une triggering condition claire** — `When to trigger` doit être actionnable
- **Pas de prompt injection** — pas d'instructions cachées, pas de role-play hijack
- **Pas de secrets en exemple** — utiliser `<placeholder>` ou `env:VAR_NAME`
- **Tests fournis** — au moins 3 exemples entrée/sortie
- **Licence explicite** — SPDX dans frontmatter + fichier LICENSE
- **Pas de dépendance lourde** — si un script est nécessaire, le rendre optionnel
- **Langue** — `en` ou `fr` en phase 0 ; autres langues phase 3

### Tarification

- Skills gratuits = `price_cents: 0`
- Skills payants = de 99 cents à 9900 cents (≤ 99 €) en phase 0
- Vous gardez **75 %** du net après TVA et fees LS. Voir
  `docs/architecture/payments.md` pour le détail du split.

### Code de conduite

Pas de skills :

- Faisant la promotion de contenu illégal, haineux, discriminatoire
- Visant la collecte de données utilisateurs (PII) sans consentement
- Faisant la promotion de produits / services concurrents directs
- Référencant des PBN, infostealers ou phishing

Violation = retrait immédiat + ban compte.

---

## 2. Contribuer au code source

> Phase 0–2 : repo **privé**, contributions externes non ouvertes.
> Phase 3+ : ouverture envisagée pour packages CLI et SDK.

### Setup

```bash
git clone git@github.com:aissablk1/forgekit-marketplace.git
cd forgekit-marketplace
pnpm install
cp .env.example .env.local   # remplir
pnpm supabase:start
pnpm dev
```

### Workflow git (sessions parallèles)

**Jamais** `git add -A` ni `git commit -a`. Stage explicite uniquement :

```bash
git add path/to/file.ts path/to/other.ts
git commit -m "feat(scope): description"
```

Branches :

- `main` — protégée, deploy prod via Vercel
- `feat/<scope>-<short-desc>`
- `fix/<scope>-<short-desc>`

### Commit convention

[Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, chore, security
Scopes: web, cli, sdk, security, shared, supabase, ops, docs
```

**Pas de `Co-Authored-By: Claude` ni autre IA** (CLAUDE.md §21).

### Tests

- Vitest pour packages JS
- Tests E2E Playwright pour flows critiques (auth, achat, install CLI)
- Coverage minimum 70 % sur `packages/security` (sensible)

```bash
pnpm test
pnpm test:e2e
```

### Style

- Prettier (`pnpm format`)
- ESLint flat config
- Tailwind classes triées par `prettier-plugin-tailwindcss`
- TypeScript strict + `noUncheckedIndexedAccess`

### PR

- Titre = conventional commit
- Description = quoi, pourquoi, comment tester
- Lien vers issue / ADR si pertinent
- CI doit être verte
- Squash & merge sur `main`

### Sécurité

Vulnérabilité ? **Ne pas ouvrir d'issue publique.**
Email : `security@forgekit.dev` (PGP key à venir).

---

© 2026 Aïssa BELKOUSSA — Tous droits réservés.
