#!/usr/bin/env bash
# Génère les 6 packages defensifs depuis _template/.
# Run : bash _defensive/generate.sh
# Puis pour chaque package :
#   cd _defensive/<nom> && npm publish --provenance --access public

set -euo pipefail
cd "$(dirname "$0")"

# Format : "nom-npm:nom-bin"
# Pour les scopes : le bin reste sans scope ("cli" pas "@cupel/cli")
PACKAGES=(
  "cuple:cuple"
  "cupell:cupell"
  "cupel-cli:cupel-cli"
  "cupel-scanner:cupel-scanner"
  "@cupel/cli:cli"
  "@cupel/doctor:doctor"
)

for entry in "${PACKAGES[@]}"; do
  pkg_name="${entry%%:*}"
  bin_name="${entry##*:}"
  pkg_dir="$pkg_name"

  echo "▶ Generating $pkg_name (bin: $bin_name)..."
  mkdir -p "$pkg_dir/bin"

  # package.json (substitution NAME + BIN_NAME)
  sed -e "s|REPLACE_NAME|$pkg_name|g" \
      -e "s|REPLACE_BIN_NAME|$bin_name|g" \
      _template/package.json > "$pkg_dir/package.json"

  # bin/index.mjs (identique)
  cp _template/bin/index.mjs "$pkg_dir/bin/index.mjs"
  chmod +x "$pkg_dir/bin/index.mjs"

  # README.md (identique)
  cp _template/README.md "$pkg_dir/README.md"

  echo "  ✓ $pkg_dir/"
done

echo ""
echo "─────────────────────────────────────────────────────────"
echo "Génération terminée. À publier :"
echo ""
for entry in "${PACKAGES[@]}"; do
  pkg_name="${entry%%:*}"
  pkg_dir="$pkg_name"
  echo "  cd _defensive/$pkg_dir && npm publish --provenance --access public"
done
echo ""
echo "Note : --provenance fonctionne uniquement depuis CI (GitHub Actions)."
echo "       Si tu publies localement, retire --provenance ou utilise"
echo "       le workflow .github/workflows/release.yml du repo principal."
