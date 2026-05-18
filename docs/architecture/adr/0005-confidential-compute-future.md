# ADR 0005 — Confidential Computing (exploration futur)

- Statut : Proposé (exploration, non-bloquant phase 0–2)
- Date : 2026-05-14
- Auteur : Aïssa BELKOUSSA

## Contexte

Certains skills cibleront à terme des données très sensibles côté client
(secrets d'entreprise, codebases propriétaires, données patients RGPD).
Les acheteurs Teams / Enterprise demanderont des garanties sur le fait que :

1. Le **code des skills ne fuit pas** côté Cupel
2. Les **inputs LLM ne sont pas loggés** côté Cupel ni revendus
3. La **chaîne de signature** est vérifiable et auditable (transparency)

En 2026, le confidential computing (Intel TDX, AMD SEV-SNP, AWS Nitro
Enclaves, Azure Confidential VMs) est mature pour des workloads JS/Wasm.
Cloudflare propose Workers Launch Pad sur Nitro, et Anthropic publie déjà
des trusted enclaves pour Claude Cowork.

## Décision (exploratoire)

**Ne pas implémenter en phase 0–2.** Documenter l'angle pour :

1. Préparer un **upsell consulting** sur le sujet (mention dans `PROJECT.nfo`)
2. Garder l'architecture compatible :
   - Code de validation skill = container Docker reproductible (peut tourner en TDX)
   - Pas de logging d'inputs utilisateurs côté Cupel dès aujourd'hui
   - Signatures Ed25519 prêtes pour intégration future dans une transparency log
     (Sigstore Rekor)

Réévaluer en phase 3 (M12+) si :

- Au moins 3 clients Enterprise demandent la garantie en RFP
- Volume justifie le coût (~$200–500/mois minimum sur AWS Nitro)
- Réglementation EU AI Act art. 15 (robustesse / transparence) impose la trace

## Conséquences

**Positives :**

- Différenciateur fort vs marketplaces concurrentes en phase 3
- Préparation de l'architecture sans coût immédiat
- Angle de prestation (audit + intégration) facturable dès phase 1

**Négatives (si implémenté) :**

- Coût infra ×3–5 vs serverless classique
- DX complexifiée pour les créateurs (attestation, remote attestation)
- Lock-in cloud (AWS Nitro spécifique, ou Azure / Cloudflare)

## Pistes techniques explorées (notes)

| Composant | Phase 3 option |
|---|---|
| Validation skill (LLM review) | AWS Nitro Enclave + Claude API via egress proxy attesté |
| Stockage clé Ed25519 | YubiHSM2 + HashiCorp Vault Transit |
| Transparency log | Sigstore Rekor self-hosted EU |
| Attestation | NSM (Nitro Security Module) + cose-sign |

## Références

- AWS Nitro Enclaves : https://aws.amazon.com/ec2/nitro/nitro-enclaves/
- Confidential Containers : https://confidentialcontainers.org/
- EU AI Act art. 15 : https://artificialintelligenceact.eu/article/15/
- Article portfolio prévu : "Confidential computing pour skills IA" (Q3 2026)
