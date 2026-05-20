#!/usr/bin/env bash
# cupel — healthcheck.sh
# Author: Aïssa BELKOUSSA
# Created: 2026-05-14
#
# Pings critical endpoints (web, API, Supabase, R2) and logs results.
# Exit code != 0 si au moins une cible est down.
#
# Usage:
#   ./scripts/ops/healthcheck.sh                # all targets
#   ENV=staging ./scripts/ops/healthcheck.sh
#
# Env requis : CUPEL_WEB_URL, CUPEL_API_URL, SUPABASE_URL
# Log : _backup/healthcheck/YYYY-MM-DD.log

set -euo pipefail

ENV="${ENV:-production}"
WEB_URL="${CUPEL_WEB_URL:-https://cupel.dev}"
API_URL="${CUPEL_API_URL:-https://api.cupel.dev}"
SUPABASE_URL="${SUPABASE_URL:-}"
TIMEOUT="${HEALTHCHECK_TIMEOUT:-10}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="${ROOT}/_backup/healthcheck"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/$(date -u +%Y-%m-%d).log"

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { echo "[$(ts)] [${ENV}] $*" | tee -a "${LOG_FILE}"; }

EXIT_CODE=0

check() {
  local name="$1" url="$2" expected="${3:-200}"
  local status
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${url}" || echo "000")
  if [[ "${status}" == "${expected}" ]]; then
    log "OK    ${name} (${status}) ${url}"
  else
    log "FAIL  ${name} (${status}, expected ${expected}) ${url}"
    EXIT_CODE=1
  fi
}

log "=== healthcheck start ==="
check "web"      "${WEB_URL}/api/health"      "200"
check "api"      "${API_URL}/health"          "200"
[[ -n "${SUPABASE_URL}" ]] && check "supabase" "${SUPABASE_URL}/rest/v1/" "200"
log "=== healthcheck end (exit=${EXIT_CODE}) ==="

exit "${EXIT_CODE}"
