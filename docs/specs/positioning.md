# Spec — Positionnement Forgekit

> Auteur : Aïssa BELKOUSSA
> Créé : 2026-05-15
> Statut : v1 — adopté avec le pivot B2B Teams

## Pourquoi un pivot

Le projet a démarré comme un marketplace payant à l'unité (vente skill 29 € avec revenue share 75/25). Deux signaux convergents rendent ce modèle non-viable :

1. **Anthropic publie ses skills gratuitement** (officiels + curated), couvrant les cas génériques (frontend, sécurité, refactoring, doc).
2. **GitHub regorge de skills communautaires** sous licences permissives, indexés par awesome-lists et installables manuellement.

Vendre un skill à l'unité revient à vendre ce que les concurrents donnent gratis. Le ticket moyen serait trop faible pour amortir le coût d'acquisition créateur + acheteur. **Conclusion** : abandonner la vente à l'unité, garder l'annuaire gratuit comme moteur d'acquisition, capter la valeur côté gouvernance B2B.

## Nouveau positionnement

> Forgekit est l'annuaire des skills IA pour devs **et** le control plane des équipes qui veulent gouverner leur usage interne.

Trois promesses :

1. **Pour tout dev** : trouver et installer le bon skill en 30 secondes, gratuitement, via CLI ou web.
2. **Pour les équipes** (Teams) : workspace privé, SSO, audit log, allowlist, skills internes non publics — pour 9 €/seat/mois.
3. **Pour les grandes entreprises** (Enterprise) : SCIM, Confidential Compute, on-prem mirror, SOC 2 — pour 29 €/seat/mois.

## Cibles

### Public (free) — moteur d'acquisition

- Dev solo (freelance, étudiant, hobbyist)
- Créateur de skill (publie pour la visibilité, pas pour le revenu)
- Lead Tech curieux qui benchmark avant d'introduire dans son équipe

**Job-to-be-done** : trouver un skill fiable, savoir qu'il a été audité, l'installer en une commande sans risque de prompt injection.

### Teams (9 €/seat) — sweet spot

- Startups Série A/B avec 10–40 devs
- Scale-ups avec plusieurs équipes produit
- Agences et studios (Vivansa, Doctolib, Alan, Pennylane, Cubyn… profils 5–50 devs)
- Équipes data + dev mixtes voulant un référentiel commun de skills

**Job-to-be-done** : « On a 25 devs qui utilisent Claude Code et Cursor, chacun installe ses propres skills depuis GitHub, on n'a aucune visibilité, et on a déjà eu deux skills malveillants installés. On veut un workspace privé avec allowlist, audit, et skills internes maison ».

**Critère décision principal** : sécurité + visibilité. Le prix (9 €/seat) est trivial vs le coût d'un incident.

### Enterprise (29 €/seat) — différenciation

- ETI 200–2 000 devs régulées (banque, assurance, santé, défense, secteur public)
- Grands comptes en transformation IA (équipes plateforme internes)
- Cibles européennes prioritaires (DORA, EU AI Act, souveraineté)

**Job-to-be-done** : « On doit prouver à notre DSI et notre RSSI que les skills installés sont auditables, signés, hébergés en UE, qu'aucun code interne ne fuit, et qu'on a un report SOC 2. On veut SCIM pour s'intégrer à Okta, et un mirror dans notre VPC pour la production ».

**Critère décision principal** : conformité + souveraineté. Le prix devient secondaire face au coût d'un audit raté ou d'un POC bloqué par la sécu.

## Concurrence

| Acteur | Modèle | Force | Faiblesse vs Forgekit |
|---|---|---|---|
| Anthropic skills officiels | Gratuit, intégré | Distribution | Pas de gouvernance B2B, pas de skills internes |
| GitHub awesome lists | Gratuit, fragmenté | Volume | Pas de signature, pas d'audit, pas de control plane |
| Cursor extensions | Captif IDE | Distribution Cursor | Mono-IDE, pas de skills cross-IDE |
| Codeium / Cody / Tabnine | Plateforme IA dev | Suite intégrée | Pas centrés skills, pas de marketplace ouvert |
| GitHub Copilot Extensions | Captif Copilot | Distribution Microsoft | Mono-IDE, pas de Confidential Compute |

**Différenciation Forgekit**
1. Multi-IDE (Claude Code + Cursor + Codex + Windsurf + Gemini CLI) — mapping cross-IDE
2. Gouvernance B2B native (SSO, audit, allowlist, skills internes)
3. Hébergement EU + Confidential Compute pour secteurs régulés
4. Signature Ed25519 + transparency log Sigstore Rekor
5. Indépendant des éditeurs IDE

## Messaging par cible

### Public (homepage gratuite)

**Headline** : « L'annuaire des skills IA pour devs. Trouve, installe, contribue — gratuitement. »
**Sub** : « 100+ skills audités et signés pour Claude Code, Cursor, Codex, Windsurf, Gemini CLI. »
**CTA** : `npx forgekit install <skill>` + bouton « Browse skills »

### Teams (landing /teams)

**Headline** : « Donne à ton équipe un workspace privé de skills IA, avec SSO, audit et allowlist. »
**Sub** : « 9 €/seat/mois. Tes devs gardent leur productivité, ton CTO retrouve sa visibilité. »
**CTA** : « Démarrer un essai 14 jours »

### Enterprise (landing /enterprise)

**Headline** : « Le control plane des skills IA pour les entreprises régulées. »
**Sub** : « SCIM, Confidential Compute, on-prem mirror, SOC 2. Hébergement EU. »
**CTA** : « Parler à un expert »

## Anti-positionnement (ce que Forgekit n'est PAS)

- **Pas un IDE** — on s'intègre à ceux qui existent, on ne les remplace pas
- **Pas un agent IA** — on distribue les capacités, on n'est pas la couche d'inférence
- **Pas une marketplace payante à l'unité** — l'annuaire est gratuit
- **Pas un GitHub bis** — on indexe et on gouverne, on n'héberge pas le code source des skills publics (on stocke le manifeste signé)
- **Pas un outil de prompt engineering** — on suppose le skill bien écrit, on s'occupe de sa distribution sécurisée

## Risques de positionnement

| Risque | Mitigation |
|---|---|
| « C'est juste un proxy Anthropic skills » | Multi-IDE + skills internes + audit cross-vendor |
| « On peut faire pareil avec GitHub + scripts maison » | Vrai pour 5 devs, faux à 25+. Vendre le coût de maintenance évité. |
| « Pas assez différencié pour justifier 9 €/seat » | Le coût d'un seul incident skill malveillant > 1 an de Teams pour 50 devs |
| « Marché trop nouveau » | Vrai en 2026. Stratégie : être présent quand le besoin devient urgent (2027–2028) |
