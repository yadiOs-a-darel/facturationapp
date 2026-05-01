#!/bin/bash
#
# Script de build standalone pour GestFacturation API
# Crée un dossier autonome avec Node.js embarqué
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR"
DATABASE_DIR="$SCRIPT_DIR/../database"
OUTPUT_DIR="$API_DIR/standalone"
NODE_VERSION="v18.19.0"

echo "=========================================="
echo "  Build standalone GestFacturation API"
echo "=========================================="
echo ""

# Nettoyer
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Télécharger Node.js Linux x64
echo "=> Téléchargement de Node.js $NODE_VERSION..."
cd "$OUTPUT_DIR"
NODE_URL="https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.xz"
curl -sL "$NODE_URL" | tar -xJ --strip-components=1
echo "✓ Node.js installé"

# Utiliser le Node embarqué pour tout le reste du script
export PATH="$OUTPUT_DIR/bin:$PATH"

# Activer pnpm via corepack (pas besoin de pnpm global)
echo "=> Activation de pnpm (corepack)..."
corepack enable >/dev/null
PNPM_BIN="$OUTPUT_DIR/bin/pnpm"
echo "✓ pnpm prêt"

# Installer les dépendances (incluant dev) pour pouvoir compiler
echo "=> Installation des dépendances (build)..."
CI=true "$PNPM_BIN" -C "$API_DIR" install --config.confirmModulesPurge=false
echo "✓ Dépendances installées"

# Build TypeScript
echo "=> Compilation TypeScript..."
"$PNPM_BIN" -C "$API_DIR" run build
echo "✓ Code compilé"

# Copier le code compilé
echo "=> Copie du code..."
mkdir -p "$OUTPUT_DIR/app"
cp -r "$API_DIR/dist" "$OUTPUT_DIR/app/"

# Installer les dépendances runtime dans le standalone (portable, sans symlinks pnpm)
echo "=> Installation des dépendances runtime (npm)..."
API_DIR="$API_DIR" OUTPUT_APP_DIR="$OUTPUT_DIR/app" "$OUTPUT_DIR/bin/node" -e "
const fs = require('fs');
const path = require('path');
const src = require(path.join(process.env.API_DIR, 'package.json'));
const { name, version } = src;
const deps = { ...(src.dependencies || {}) };
delete deps['@gestfacturation/database']; // copié manuellement (workspace)
const out = {
  name: name || 'gestfacturation-api-standalone',
  version: version || '0.0.0',
  private: true,
  main: 'dist/index.js',
  type: 'commonjs',
  dependencies: deps
};
fs.writeFileSync(path.join(process.env.OUTPUT_APP_DIR, 'package.json'), JSON.stringify(out, null, 2));
"

cd "$OUTPUT_DIR/app"
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false
"$OUTPUT_DIR/bin/npm" install --omit=dev --no-package-lock
echo "✓ Dépendances runtime installées"

# Copier les fichiers du database (pour drizzle-orm)
mkdir -p "$OUTPUT_DIR/app/node_modules/@gestfacturation"
rm -rf "$OUTPUT_DIR/app/node_modules/@gestfacturation/database"
cp -r "$DATABASE_DIR" "$OUTPUT_DIR/app/node_modules/@gestfacturation/database"

# Créer le script de démarrage
cat > "$OUTPUT_DIR/start.sh" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODE_ENV=production
exec "$SCRIPT_DIR/bin/node" "$SCRIPT_DIR/app/dist/index.js" "$@"
EOF
chmod +x "$OUTPUT_DIR/start.sh"

# Créer un lien symbolique vers l'exécutable
ln -sf start.sh "$OUTPUT_DIR/gesfacturation"

echo ""
echo "=========================================="
echo "  ✓ Build standalone terminé !"
echo "=========================================="
echo ""
echo "Dossier : $OUTPUT_DIR"
echo ""
echo "Pour lancer l'API :"
echo "  $OUTPUT_DIR/gesfacturation"
echo ""
echo "Pour déployer, copiez le dossier $OUTPUT_DIR entier."
echo ""
