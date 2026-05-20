#!/usr/bin/env bash
# push-wave-2026-05-20.sh
# Clôture wave CVE Next.js 06/05/2026 — pousse les 6 projets patchés ce 2026-05-20
# Auteur : Aïssa BELKOUSSA
#
# Respecte la règle « max 3 auto-deploy Vercel simultanés »
# (cf. feedback_vercel_deploy_limits.md) en 2 batches manuels.
#
# Usage :
#   bash scripts/push-wave-2026-05-20.sh batch1   # cupel + VIRGA + VALIBAN
#   bash scripts/push-wave-2026-05-20.sh batch2   # DropOrch + SELFPOD + Handler Catcher
#   bash scripts/push-wave-2026-05-20.sh status   # voir l'état des commits non pushés
#
# Tu peux interrompre entre batches pour laisser Vercel digérer.

set -euo pipefail

readonly BASE="/Volumes/Professionnel/Projets/Développement/Concepts"
readonly GH_USER="aissablk1"

color_ok()    { printf '\033[32m%s\033[0m\n' "$*"; }
color_warn()  { printf '\033[33m%s\033[0m\n' "$*"; }
color_err()   { printf '\033[31m%s\033[0m\n' "$*"; }
color_info()  { printf '\033[36m%s\033[0m\n' "$*"; }

push_existing_remote() {
  local dir="$1"
  local name="$2"
  color_info "→ $name : push origin main"
  cd "$BASE/$dir"
  if ! git remote get-url origin >/dev/null 2>&1; then
    color_err "  ✗ pas de remote 'origin' configuré. Skip."
    return 1
  fi
  if git push origin main; then
    color_ok "  ✓ $name poussé"
  else
    color_err "  ✗ push $name échoué"
    return 1
  fi
}

create_and_push() {
  local dir="$1"
  local repo_name="$2"
  color_info "→ $repo_name : gh repo create (private) + push"
  cd "$BASE/$dir"
  if git remote get-url origin >/dev/null 2>&1; then
    color_warn "  remote 'origin' déjà configuré, simple push"
    git push origin main && color_ok "  ✓ $repo_name poussé"
    return $?
  fi
  if gh repo create "$GH_USER/$repo_name" --private --source=. --remote=origin --push; then
    color_ok "  ✓ $repo_name créé + poussé"
  else
    color_err "  ✗ gh repo create $repo_name échoué"
    return 1
  fi
}

show_status() {
  local dir="$1"
  local name="$2"
  cd "$BASE/$dir" 2>/dev/null || { color_err "$name : dossier introuvable"; return; }
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    color_warn "$name : pas de repo git"
    return
  fi
  local unpushed
  if git rev-parse '@{u}' >/dev/null 2>&1; then
    unpushed=$(git log --oneline '@{u}..HEAD' | wc -l | tr -d ' ')
    if [[ "$unpushed" == "0" ]]; then
      color_ok "$name : up-to-date"
    else
      color_warn "$name : $unpushed commits non poussés"
    fi
  else
    local local_commits
    local_commits=$(git log --oneline 2>/dev/null | wc -l | tr -d ' ')
    color_warn "$name : pas d'upstream (jamais push), $local_commits commits locaux prêts"
  fi
}

cmd_batch1() {
  color_info "═══ Batch 1 — cupel + VIRGA + VALIBAN ═══"
  push_existing_remote "cupel" "cupel" || true
  push_existing_remote "VIRGA" "VIRGA" || true
  create_and_push "VALIBAN" "valiban" || true
  echo
  color_ok "Batch 1 terminé. Attends que Vercel digère avant batch2 si tu veux respecter max 3 simultanés."
}

cmd_batch2() {
  color_info "═══ Batch 2 — DropOrch + SELFPOD + Handler Catcher ═══"
  create_and_push "DropOrch" "droporch" || true
  create_and_push "SELFPOD" "selfpod" || true
  create_and_push "Handler Catcher" "handler-catcher" || true
  echo
  color_ok "Batch 2 terminé. Wave CVE 06/05/2026 clôturée."
}

cmd_status() {
  color_info "═══ État des commits non poussés ═══"
  show_status "cupel" "cupel"
  show_status "VIRGA" "VIRGA"
  show_status "VALIBAN" "VALIBAN"
  show_status "DropOrch" "DropOrch"
  show_status "SELFPOD" "SELFPOD"
  show_status "Handler Catcher" "Handler Catcher"
}

main() {
  local cmd="${1:-status}"
  case "$cmd" in
    batch1) cmd_batch1 ;;
    batch2) cmd_batch2 ;;
    status) cmd_status ;;
    *) echo "Usage: $0 {batch1|batch2|status}" >&2; exit 2 ;;
  esac
}

main "$@"
