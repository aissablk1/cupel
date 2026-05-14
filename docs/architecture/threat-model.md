# Threat Model — Forgekit Marketplace (STRIDE)

**Auteur** : Aïssa BELKOUSSA

Application de la méthode STRIDE (Microsoft) aux surfaces de la marketplace Forgekit. Chaque ligne suit : **Menace → Vecteur → Impact → Contre-mesure → Statut**.

---

## Scope

| Composant                | Rôle                                        |
| ------------------------ | ------------------------------------------- |
| `apps/web`               | Marketplace web (Next.js)                   |
| `packages/cli`           | CLI d'installation côté utilisateur final   |
| `packages/security`      | Scan + signature                            |
| `apps/api`               | API back-end (upload, search, billing)      |
| `cdn.forgekit.dev`       | Distribution tarballs signés                |
| Stripe                   | Paiements + payouts publishers              |

Acteurs : **Utilisateur** (consume skills), **Publisher** (upload skills), **Admin Forgekit**, **Attaquant externe**.

---

## S — Spoofing (usurpation d'identité)

| # | Vecteur                                                | Impact                                  | Contre-mesure                                                              | Statut       |
| - | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| S1 | Attaquant publie un skill en se faisant passer pour un publisher connu | Confusion utilisateur, install malicieux | Compte vérifié (email + OTP), signature Ed25519 liée au compte, badge "verified" | implémenté   |
| S2 | Spoofing email envoi confirmation publisher          | Phishing                                | SPF + DKIM + DMARC `reject` sur `forgekit.dev`                             | à confirmer  |
| S3 | CDN serveur typosquatté (`forgkit.dev`)               | Install depuis source malveillante      | CLI hardcode `api.forgekit.dev` + cert pinning option                       | partiel      |
| S4 | OAuth callback hijack                                  | Prise de contrôle compte                | `state` + PKCE, redirect URI strict                                         | implémenté   |

## T — Tampering (altération)

| # | Vecteur                                                | Impact                                  | Contre-mesure                                                              | Statut       |
| - | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| T1 | MITM sur le tarball entre CDN et CLI                 | Code injecté côté utilisateur           | HTTPS obligatoire + vérification `verifyManifest` Ed25519                  | implémenté   |
| T2 | Modification du manifest en base (DB compromise)      | Skill modifié non détecté               | Hash signé Ed25519 stocké + recalcul à chaque fetch                        | implémenté   |
| T3 | Zip-slip lors de l'unzip côté serveur                 | Écriture hors workspace                 | yauzl streaming + reject `..` + reject symlinks                            | implémenté   |
| T4 | Tampering CI artifacts                                 | Publication d'un build altéré           | OIDC GitHub → Vault, signature CI dédiée                                   | planifié     |

## R — Repudiation (déni d'action)

| # | Vecteur                                                | Impact                                  | Contre-mesure                                                              | Statut       |
| - | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| R1 | Publisher nie avoir uploadé un skill malicieux        | Litige légal, KYC                       | Logs Postgres immuables + signature liée au compte + KYC Stripe Connect    | implémenté   |
| R2 | Utilisateur nie un achat                               | Chargeback frauduleux                   | Stripe payment intent + email confirmation + IP/UA log                     | implémenté   |
| R3 | Admin Forgekit modifie un skill sans trace            | Perte de confiance                      | Audit log append-only (Postgres + Loki) sur toute action admin             | implémenté   |

## I — Information disclosure (fuite)

| # | Vecteur                                                | Impact                                  | Contre-mesure                                                              | Statut       |
| - | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| I1 | Secret hardcodé dans un skill uploadé                 | Fuite credentials du publisher          | `scanContentForSecrets` bloquant à l'upload + alerte au publisher          | implémenté   |
| I2 | API key Anthropic exposée client (NEXT_PUBLIC_)      | Drain credit OpenAI/Anthropic           | CLAUDE.md §5 + lint config Next.js (forbid NEXT_PUBLIC_*KEY)               | implémenté   |
| I3 | PII utilisateur dans logs                              | RGPD violation                          | Pino redact paths + retention 30 j sur logs PII                            | implémenté   |
| I4 | Skill malicieux exfiltre données du contexte agent    | Vol prompts/code utilisateur            | `scanContentForDangerousCode` (fetch externe flaggé) + sandbox runtime     | partiel      |
| I5 | Réponse SQL leak via injection                         | Dump DB                                 | Drizzle ORM paramétré, jamais de raw SQL avec interpolation                | implémenté   |
| I6 | Stripe webhook secret leak                             | Faux events de paiement                 | Secret stocké Vault, vérification signature à chaque webhook               | implémenté   |

## D — Denial of service

| # | Vecteur                                                | Impact                                  | Contre-mesure                                                              | Statut       |
| - | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| D1 | Upload zip-bomb                                        | OOM serveur upload                      | Cap décompression 50 Mo + ratio < 100x + max 5000 entrées                  | implémenté   |
| D2 | Flood requêtes API                                     | Indisponibilité                         | Rate limit IP + per-account + Cloudflare bot fight                         | implémenté   |
| D3 | LLM review abuse (coût)                                | Drain budget Anthropic                  | LLM review uniquement post-scan + cap 60k chars + quota par publisher      | implémenté   |
| D4 | Slow loris sur API                                     | Connexions saturées                     | Timeout 30s + reverse proxy Cloudflare/Vercel                              | implémenté   |
| D5 | Regex catastrophic backtracking sur secrets scan      | CPU spike worker                        | Patterns testés, bornes `{36,}` plafonnées, timeout scan 10s par fichier   | à durcir     |

## E — Elevation of privilege

| # | Vecteur                                                | Impact                                  | Contre-mesure                                                              | Statut       |
| - | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| E1 | Skill malicieux exécute `child_process` côté agent    | RCE sur la machine de l'utilisateur     | Scan critical → fail + sandbox runtime côté CLI (planifié)                 | partiel      |
| E2 | Prompt-injection escalade l'agent vers commandes shell| RCE indirecte via l'agent               | `scanContentForPromptInjection` + LLM review + warning UI utilisateur      | implémenté   |
| E3 | IDOR sur API (`/skills/:id`)                          | Modification skill d'autrui             | Vérif `account_id` matche owner sur toute mutation                         | implémenté   |
| E4 | Privilege escalation admin via session fixation       | Compte admin compromis                  | Cookies httpOnly + secure + SameSite=strict + rotation session             | implémenté   |
| E5 | Compromission root signing key                         | Backdoor toute la marketplace           | Root key en HSM, jamais sur serveur web, rotation annuelle, BCP documenté  | implémenté   |

---

## Priorisation (top 5 risques résiduels)

1. **I4** — Exfiltration via skill : la détection statique est limitée. Roadmap : sandbox runtime côté CLI (process séparé, FS readonly, network deny par défaut).
2. **E1** — RCE via skill exécuté par agent : même remédiation que I4.
3. **D5** — ReDoS sur les regex de scan : ajouter un timeout par fichier et fuzz les patterns.
4. **S3** — Typosquatting domaine : ajouter cert pinning en option du CLI.
5. **T4** — CI artifact tampering : finaliser OIDC + signature CI dédiée.

---

## Process

- Threat model **revu trimestriellement** ou à tout changement majeur d'architecture.
- Toute nouvelle feature passe par une mini-section STRIDE dans son ADR.
- Incidents alimentent `docs/runbooks.md` et déclenchent une mise à jour de ce document.
