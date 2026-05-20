---
title: VIRGA — commits thématiques + bump Next.js
date: 2026-05-20
auteur: Aïssa BELKOUSSA
---

## Contexte

Working tree VIRGA dirty depuis le 28/04/2026 (rebrand éditorial complet,
38 fichiers, +929/-713 lignes) + ajout easter-egg du 16/05. Tous les
travaux ont été commités en 8 lots thématiques propres, puis le bump
Next.js 15.5.18 a été appliqué sur base clean (lot 9).

Branche : `main`. HEAD avant : `9c66641`. HEAD après : `3a729e0`.
Build `pnpm build` vérifié OK avant et après bump.

Tous les commits sont signés **`Aïssa BELKOUSSA <contact@aissabelkoussa.fr>`**
(CLAUDE.md §21 — aucun `Co-Authored-By` IA, aucun emoji).

## Phase 1 — Commits thématiques

| # | SHA | Message | Fichiers | Lignes |
|---|---|---|---|---|
| 1 | `ce043e5` | `chore(web): add motion + focus-trap-react deps` | 2 | +94 |
| 2 | `1b61c65` | `feat(web): rebrand Ecosia palette + warm paper light theme` | 4 | +215 / -60 |
| 3 | `6efebb9` | `feat(web): switch fonts to Fraunces / Newsreader / JetBrains Mono + skip-link` | 1 | +33 / -1 |
| 4 | `640ccef` | `feat(web): editorial home with HomeHero + Logo + numbered sections` | 4 | +441 / -261 |
| 5 | `4e51165` | `feat(web): focus-trap modals + WCAG a11y hardening across components` | 9 | +264 / -77 |
| 6 | `2523a73` | `feat(web): add /compliance, drop public /api, skip-link target on all pages` | 16 | +442 / -314 |
| 7 | `6febd52` | `docs: add go-to-market pack (ICP, cold-emails, EU-CRCF brief)` | 17 | +2323 |
| 8 | `8304900` | `feat(web): easter-egg /aissabelkoussa redirect 308 noindex` | 2 | +29 |

### Détail des regroupements

- **#1 deps** — `apps/web/package.json` + `pnpm-lock.yaml` isolés en premier
  pour clarté du diff.
- **#2 rebrand palette** — `globals.css` (palette + light theme) + `icon.tsx`
  (logo SVG gradient) + `opengraph-image.tsx` + `lib/og.tsx` (OG cards
  alignés sur nouveaux tokens).
- **#3 fonts + skip-link** — `layout.tsx` seul : injection `next/font`
  Fraunces/Newsreader/JetBrains Mono + skip-link WCAG 2.4.1 ajouté
  en même temps (lié au rendu typographique du header).
- **#4 home éditoriale** — `HomeHero.tsx` (nouveau, motion/react), `Logo.tsx`
  (nouveau), `page.tsx` (refonte №01/№02), `HeroShader.tsx` (reduced-motion
  off pour le shader, regroupé ici car composant du hero).
- **#5 a11y polish** — 9 composants modifiés : `CommandPalette` + `HelpDialog`
  (FocusTrap + restitution focus WCAG 2.4.3), `InquiryForm` (aria-live +
  refonte plans cohort), `MethodologyToc` (RAF-throttling), `ExploreClient`,
  `ProjectActions`, `JsonLd`, `CmdKHint`, `ThemeToggle`.
- **#6 /compliance + #main** — `compliance/` (nouveau), `next.config.ts`
  (redirect 308 /api → /compliance), suppression `app/api/page.tsx` +
  `opengraph-image.tsx`, et les 11 pages avec `id="main"` ajouté (cible
  du skip-link du commit #3). Regroupement justifié : c'est le même
  pivot positionnement /api → /compliance qui motive les `id="main"`.
- **#7 go-to-market** — 8 docs `.md` + 9 exports `pdf/docx/html` dans
  `docs/go-to-market/exports/`.
- **#8 easter-egg** — touche du 16/05, séparée comme demandé.

### Fichier non commité

`apps/web/tsconfig.tsbuildinfo` — artefact de build local, ni gitignored
ni tracké. Laissé en untracked (à exclure via `.gitignore` plus tard,
hors scope de cette session).

## Phase 2 — Bump Next.js

- **Statut** : **OK**
- **Avant** : `next: "^15.5.4"`
- **Après** : `next: "15.5.18"` (épinglé exact)
- **SHA** : `3a729e0`
- **Snapshot** : `_backup/nextjs_patch_2026-05-20_18h29/`
  (`package.json` + `pnpm-lock.yaml` originaux)
- **Build** : `pnpm build` OK en 25.1s, aucun durcissement
  `LayoutProps` requis (≠ cupel qui avait souffert)
- **pnpm install** : `+4 -4` packages, lockfile mis à jour proprement

## Push restant à faire (Aïssa)

```bash
cd "/Volumes/Professionnel/Projets/Développement/Concepts/VIRGA"
git push origin main
```

9 commits locaux en avance sur `origin/main` (8 thématiques + 1 bump
sécurité). Aucun conflit attendu, branche linéaire sur `main`.
