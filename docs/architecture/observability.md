# Architecture — Observabilité

> Stack : Sentry (errors+traces) + Plausible (analytics) + Better Stack (logs centralisés) + Statuspage (status public).
> Author : Aïssa BELKOUSSA

## SLOs (Service Level Objectives)

| Service | Target | Mesure |
|---|---|---|
| Uptime web | 99.9 % | Healthcheck 60s + Statuspage |
| API p95 latency | < 500 ms | Sentry traces |
| Error rate web | < 0.5 % | Sentry |
| Edge function p95 | < 300 ms | Supabase + Sentry |
| CLI download success | > 99.5 % | Cloudflare R2 metrics |
| Webhook LS success | 100 % | Better Stack + alert |

## Sources

| Source | Outil | Rétention | Coût mai 2026 |
|---|---|---|---|
| Errors frontend/server | Sentry | 30 j (Team) | $26/mois |
| Logs structurés | Better Stack | 7 j → R2 archive | $0 (free) puis $25 |
| Web analytics | Plausible Cloud | 12 mois | $9/mois |
| Performance traces | Sentry tracing | 30 j | inclus |
| Status public | Statuspage.io | — | $29/mois plan Starter |

## Alerts

| Condition | Canal | Severité |
|---|---|---|
| Webhook LS down 3 fois en 10 min | Email + Telegram | P1 |
| Error rate web > 2 % sur 15 min | Email | P2 |
| DB queries p95 > 1 s | Email | P2 |
| Skill publié avec score sécurité < 60 | Email immédiat | P1 |
| Healthcheck DB down 60 s | Email + SMS | P1 |
| CVE critique sur dépendance | Email hebdo | P3 |

## Runbooks

Voir `runbooks.md` pour les procédures :
- Webhook Lemon Squeezy down
- Supabase down
- Cloudflare R2 5xx
- Skill malveillant publié
- DB migration foireuse rollback
- Stripe payout failed
