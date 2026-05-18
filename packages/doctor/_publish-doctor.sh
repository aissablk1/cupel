#!/usr/bin/env bash
# Publication @forgekit/doctor sur npm.
#
# Prerequis : etre connecte a npm (npm whoami doit repondre).
# Si non connecte : npm login    (interactif, ouvre le navigateur)
#
# Lancer depuis n'importe ou :
#   bash /Volumes/Professionnel/Projets/Developpement/Concepts/forgekit-marketplace/packages/doctor/_publish-doctor.sh

set -euo pipefail

cd "$(dirname "$0")"

echo "→ npm whoami :"
npm whoami

echo "→ pnpm publish --access public --no-git-checks"
pnpm publish --access public --no-git-checks

echo "✓ Publie. Test : npx @forgekit/doctor@latest"
