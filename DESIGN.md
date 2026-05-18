# DESIGN.md — Cupel

> Direction esthétique unique, choisie et validée avant toute ligne de code UI.
> Conforme à CLAUDE.md §10 + design-anti-slop.md.

---

## Direction : **Editorial Premium**

Croisement Stripe (rigueur du typographique) × Linear (densité d'information maîtrisée) × Are.na (asymétrie éditoriale, blanc, parti pris).

### Pourquoi ce choix

- **Cible** : développeurs pros, créateurs de skills, CTOs — public exigeant, sensible au craft.
- **Différenciation** : la concurrence (GitHub marketplace, Cursor directory) joue le « dev tools brutaliste sombre ». On part à contre-courant : clair, calme, éditorial.
- **Scalabilité** : la direction supporte aussi bien la landing marketing que le dashboard data-dense.

---

## Typographie

| Usage | Police | Poids | Source | Notes |
|---|---|---|---|---|
| Display | **Migra** | 600 | Pangram Pangram (licence requise) ou fallback `Romana` | Serif éditorial fort, condensé |
| Body | **Geist Sans** | 400 / 500 | Vercel, libre, hors blacklist | Sans humaniste moderne |
| Mono | **JetBrains Mono** | 400 / 500 | Free | Pour terminal demos, code, IDs |
| Accent éditorial | **Newsreader** | 400 italic | Google Fonts | Italiques de citation, intertitres |

**Bannies (CLAUDE.md anti-slop)** : Inter, Roboto, Arial, Open Sans, Lato, system-ui, Space Grotesk.

### Échelle typographique

Basée sur ratio modulaire 1.250 (major third), ancre 16 px.

| Token | Taille | Line-height | Usage |
|---|---|---|---|
| `text-7xl` | 4.768 rem (76.3 px) | 0.95 | Display landing |
| `text-6xl` | 3.815 rem (61 px) | 0.98 | H1 page |
| `text-5xl` | 3.052 rem (48.8 px) | 1.05 | H2 section |
| `text-4xl` | 2.441 rem (39 px) | 1.10 | H3 |
| `text-3xl` | 1.953 rem (31.2 px) | 1.20 | H4 |
| `text-2xl` | 1.563 rem (25 px) | 1.30 | Lead paragraph |
| `text-xl` | 1.25 rem (20 px) | 1.40 | Sub-lead |
| `text-base` | 1 rem (16 px) | 1.65 | Body |
| `text-sm` | 0.8 rem (12.8 px) | 1.55 | Meta, labels |
| `text-xs` | 0.64 rem (10.2 px) | 1.40 | Captions, badges |

---

## Couleurs

### Palette principale

```
Ivoire     #FAF8F5   /* fond principal */
Encre      #0B0D0E   /* texte principal */
Graphite   #3A3D40   /* texte secondaire */
Brume      #ECE8E0   /* fond sections alternées */
Lin        #DDD7CB   /* bordures, séparateurs */
```

### Accents (parcimonie absolue)

```
Terracotta #C9573B   /* CTA primaire, accents éditoriaux */
Sage       #7A8471   /* CTA secondaire, success */
Encre nuit #1A1F2E   /* dark mode primaire */
Or pâle    #C8A668   /* badges verified, premium */
Carmin     #962D2D   /* erreurs, destructifs */
```

### Sémantique

- **Fond** : ivoire (`#FAF8F5`)
- **Texte** : encre (`#0B0D0E`) — contraste WCAG AAA sur ivoire
- **Liens** : encre + soulignement avec `text-underline-offset: 0.25em` et `text-decoration-thickness: 1px`
- **CTA primaire** : terracotta + texte ivoire
- **CTA secondaire** : transparent + bordure encre 1px + texte encre

### Interdictions

- ❌ Gradient purple-to-blue sur blanc (banni anti-slop)
- ❌ Tout gradient pastel saturé
- ❌ Shadows par défaut Tailwind (`shadow-sm`, `shadow-lg`) — remplacer par bordures fines

---

## Espacement (baseline grid 8 px)

```
2xs   4px
xs    8px
sm    12px
md    16px
lg    24px
xl    32px
2xl   48px
3xl   64px
4xl   96px
5xl   128px
6xl   192px
```

Sections principales : 192 px de respiration verticale entre blocs majeurs sur desktop.

---

## Layout

### Grille

- 12 colonnes, gouttières 24 px, margins latérales 64 px (desktop) → 16 px (mobile)
- Max-width content : `1280px` standard, `880px` pour articles éditoriaux, `1440px` pour catalogue dense
- **Asymétrie obligatoire** : pas de centrage systématique. Les blocs respirent à 7/12, 8/12, 5/12 avec breakouts ponctuels.

### Layouts BANNIS

- ❌ Hero centré + 3 colonnes features + CTA + footer 4 colonnes
- ❌ Cards uniformes en grille parfaite sans rythme
- ❌ Headers sticky avec menu hamburger pleine largeur

### Patterns autorisés

- Hero **éditorial asymétrique** : H1 en 8/12 à gauche, paragraphe 4/12 à droite décalé
- **Stacked rhythm** : grandes sections monolithiques alternant ivoire/brume
- **Table éditoriale** : pour stats, comparatifs (Stripe-like)
- **Sidebar narrative** : navigation contextuelle dans articles longs

---

## Animations (Framer Motion)

### Easings de référence

```typescript
const ease = {
  out: [0.32, 0.72, 0, 1],        // out-expo doux, mouvement UI
  in: [0.85, 0, 0.15, 1],          // in-expo entrée
  inOut: [0.65, 0, 0.35, 1],       // transitions de page
  spring: { type: 'spring', stiffness: 180, damping: 22 },
};
```

### Durées

- Micro (hover, focus) : 150-200 ms
- UI standard : 400-600 ms
- Transitions de page : 600-800 ms
- Reveal au scroll : 800-1200 ms

### Patterns autorisés

- Stagger sur grilles (40-80 ms entre éléments)
- Reveal `y: 24 → 0` + `opacity: 0 → 1` (jamais juste opacity)
- Hover cards : `scale: 1.02` + bordure qui s'épaissit
- Parallaxe **très** subtile (`y: -20px à -40px max`)

### Patterns BANNIS

- ❌ Bounce / wobble par défaut
- ❌ Rotate au hover sans raison
- ❌ Glassmorphism / blur exagéré
- ❌ Animations sans raison fonctionnelle

### Respect `prefers-reduced-motion`

Tout `motion.X` reçoit un fallback statique. Hook custom `useReducedMotion()` partagé.

---

## Composants — règles transversales

### Boutons

- Rayon : `4px` (jamais full-rounded, jamais carré pur)
- Hauteur : `40px` standard, `48px` CTA principal
- Padding horizontal : `20px` standard, `28px` CTA principal
- Focus visible : outline `2px` terracotta + offset `2px`

### Cards

- Bordure : `1px solid #DDD7CB`
- Pas de shadow par défaut (interdit)
- Hover : bordure passe à `1px solid #0B0D0E` + translation `y: -2px`

### Inputs

- Sous-soulignement éditorial (bottom-border only) en mode display
- Bordure complète en mode formulaire (login, checkout)
- Label toujours au-dessus, jamais placeholder seul

---

## Iconographie

- Bibliothèque : **Phosphor Icons** (variant `Duotone` ou `Regular`)
- Taille standard : 20 px (body), 24 px (navigation), 16 px (inline)
- Stroke width : `1.5` constant
- Pas de Heroicons par défaut (trop générique)

---

## Imagerie

- Photos : grain léger, palette désaturée vers terracotta/sage
- Illustrations : line-art ou collage éditorial, jamais flat illustrations corporate
- Captures écran terminal : background `#0B0D0E`, texte JetBrains Mono `#FAF8F5`, accent terracotta sur les commandes

---

## Accessibilité (WCAG 2.2 AA strict)

- Contraste minimum 4.5:1 pour texte normal, 3:1 pour ≥18 px gras
- Focus visible 2 px terracotta + offset 2 px
- Touch targets ≥ 44 px sur mobile
- Couleur jamais seule porteuse de sens (toujours + icône ou texte)
- `prefers-reduced-motion` honoré partout
- Test clavier 100 % avant chaque release UI

---

## Mode sombre

Optionnel à activation manuelle (pas auto par OS). Inversion :

- Fond → Encre nuit `#1A1F2E`
- Texte → Ivoire `#FAF8F5`
- Terracotta → légèrement saturé pour conserver contraste
- Sage → légèrement éclairci

Pas de mode sombre forcé : la direction Editorial Premium s'exprime mieux en clair.

---

## Références sourcées (avant code)

À sourcer via MCP Magic 21st.dev avant chaque composant non-trivial :
- Stripe homepage 2025 — typographie + asymétrie
- Linear changelog — densité d'info + lisibilité
- Are.na profile pages — layout éditorial asymétrique
- Anthropic blog — palette claire calme + serif display
- Vercel /blog — composition long-form

---

## Checklist anti-slop (CLAUDE.md §9 design-anti-slop)

Avant tout commit UI :

- [ ] Direction esthétique nommée dans le commit ou PR
- [ ] Polices hors blacklist
- [ ] Gradient purple-blue absent
- [ ] Layout hors layouts bannis
- [ ] `prefers-reduced-motion` géré
- [ ] Touch targets ≥ 44 px
- [ ] Contraste WCAG AA vérifié
- [ ] Focus visible
- [ ] Composant testé au clavier
- [ ] Pas de shadow par défaut Tailwind
- [ ] Animations Framer Motion (pas CSS keyframes pour UI complexe)
- [ ] Référence sourcée (Magic MCP ou doc maison) avant code from scratch

---

**Auteur** : Aïssa BELKOUSSA
**Date** : 2026-05-14
**Statut** : v1 — base validée pour Phase 0
