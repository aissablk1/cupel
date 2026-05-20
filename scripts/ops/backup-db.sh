#!/usr/bin/env bash
# cupel — backup-db.sh
# Author: Aïssa BELKOUSSA
# Created: 2026-05-14
#
# pg_dump de la base Supabase Postgres -> upload Cloudflare R2.
# Backup chiffré (age) avant upload. Rotation côté R2 (lifecycle 90j).
#
# Usage:
#   ./scripts/ops/backup-db.sh
#
# Env requis :
#   SUPABASE_DB_URL          (postgres://...)
#   R2_BUCKET                (ex. cupel-backups)
#   R2_ENDPOINT              (https://<accountid>.r2.cloudflarestorage.com)
#   AWS_ACCESS_KEY_ID        (R2 access key)
#   AWS_SECRET_ACCESS_KEY    (R2 secret key)
#   BACKUP_AGE_RECIPIENT     (age pubkey pour chiffrement)
#
# Prérequis : pg_dump >= 16, aws-cli, age, gzip

set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL manquant}"
: "${R2_BUCKET:?R2_BUCKET manquant}"
: "${R2_ENDPOINT:?R2_ENDPOINT manquant}"
: "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT (clé publique age) manquant}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STAMP="$(date -u +%Y-%m-%d_%H%M%SZ)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

DUMP_FILE="${TMP_DIR}/cupel_${STAMP}.sql.gz"
ENC_FILE="${DUMP_FILE}.age"
REMOTE_KEY="daily/cupel_${STAMP}.sql.gz.age"

echo "[$(date -u +%FT%TZ)] pg_dump start"
pg_dump \
  --no-owner --no-privileges --clean --if-exists \
  --format=plain \
  "${SUPABASE_DB_URL}" | gzip -9 > "${DUMP_FILE}"

SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
echo "[$(date -u +%FT%TZ)] dump ok (${SIZE})"

echo "[$(date -u +%FT%TZ)] age encrypt"
age -r "${BACKUP_AGE_RECIPIENT}" -o "${ENC_FILE}" "${DUMP_FILE}"

echo "[$(date -u +%FT%TZ)] upload R2 -> s3://${R2_BUCKET}/${REMOTE_KEY}"
aws s3 cp \
  --endpoint-url "${R2_ENDPOINT}" \
  "${ENC_FILE}" "s3://${R2_BUCKET}/${REMOTE_KEY}" \
  --only-show-errors

echo "[$(date -u +%FT%TZ)] backup ok — ${REMOTE_KEY}"

# Log local (rétention 30j gérée par OS)
LOG_DIR="${ROOT}/_backup/db-backup"
mkdir -p "${LOG_DIR}"
echo "${STAMP}  ${SIZE}  ${REMOTE_KEY}" >> "${LOG_DIR}/log.tsv"
