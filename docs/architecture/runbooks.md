# Runbooks — Incidents Forgekit

> Author : Aïssa BELKOUSSA

## R-001 Webhook Lemon Squeezy down

**Symptômes** : achats LS sans purchase en DB, plaintes utilisateurs.

1. Vérifier l'Edge Function dans Supabase Dashboard → Logs `lemonsqueezy-webhook`
2. Vérifier le statut LS : status.lemonsqueezy.com
3. Si LS up : déclencher resync manuel `pnpm tsx scripts/lemonsqueezy/sync-orders.ts`
4. Si Edge Function down : redéployer `supabase functions deploy lemonsqueezy-webhook`
5. Vérifier la signature secret n'a pas été rotée

## R-002 Supabase indisponible

**Symptômes** : 503 healthcheck, app refuse les requêtes.

1. Vérifier status.supabase.com
2. Activer mode read-only frontend via flag (à implémenter)
3. Communiquer sur Statuspage
4. Attendre RTO Supabase (généralement < 15 min)
5. Postmortem dans `docs/sessions/postmortem-YYYY-MM-DD.md`

## R-003 R2 5xx sur downloads

**Symptômes** : CLI `forgekit install` échoue, logs CF R2.

1. Vérifier dashboard Cloudflare R2
2. Vérifier credentials non rotés
3. Fallback : générer signed URL Supabase Storage temporaire
4. Annoncer sur Statuspage

## R-004 Skill malveillant publié

**Symptômes** : signalement user, alerte sécurité, score scan suspect.

1. Suspendre immédiatement : update `skills set status='suspended' where id='…'`
2. Identifier les users qui ont installé : query `installs join skills`
3. Email warning à tous les installeurs avec instructions de suppression
4. Si exploitation active : forcer désinstallation via CLI auto-update
5. Investiguer comment le scan est passé (gap dans `packages/security`)
6. Patcher le scanner, ajouter test fixture
7. Postmortem public

## R-005 Migration DB foireuse

**Symptômes** : `supabase db push` échoue ou casse prod.

1. STOP — ne pas insister
2. Rollback : `supabase db reset` sur staging d'abord pour valider
3. Backup vérifié : `pg_dump` quotidien dans R2 — restore si nécessaire
4. Fix migration en local, retest staging complet
5. Re-push avec validation manuelle

## R-006 Stripe payout failed

**Symptômes** : payout status `failed`, créateur sans virement.

1. Consulter Stripe Dashboard → raison du fail (KYC, IBAN, AML)
2. Email créateur avec lien account onboarding refresh
3. Retry transfer après réconciliation
4. Si récurrent : suspend account jusqu'à résolution

## R-007 Pic de trafic Product Hunt / HN

**Symptômes** : latence p95 monte, DB connections saturées.

1. Augmenter le plan Vercel temporairement
2. Activer Supabase pooler ($65/mois)
3. Activer cache Cloudflare devant les pages catalogue
4. Désactiver opérations non critiques (analytics ingest)
5. Communiquer sur Statuspage "degraded performance"
