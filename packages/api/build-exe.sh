#!/bin/bash
#
# Script de build de l'exécutable autonome GestFacturation
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR"
DATABASE_DIR="$SCRIPT_DIR/../database"
OUTPUT_DIR="$API_DIR/bin"
BIN_NAME="gesfacturation"

echo "=========================================="
echo "  Build de l'exécutable GestFacturation"
echo "=========================================="
echo ""

# Nettoyer
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Build TypeScript
echo "=> Compilation TypeScript..."
cd "$API_DIR"
npm run build
echo "✓ Code compilé"

# Le database est maintenant inclus directement dans src/database/
echo "✓ Database inclus dans src/database/"

# Build avec pkg
echo "=> Création de l'exécutable avec pkg..."
cd "$API_DIR"
pnpm exec pkg . --targets node18-linux-x64 --output "$OUTPUT_DIR/$BIN_NAME"

# Résultat
echo ""
echo "=========================================="
echo "  ✓ Exécutable créé avec succès !"
echo "=========================================="
echo ""
ls -lh "$OUTPUT_DIR/$BIN_NAME"
echo ""
echo "Pour tester l'exécutable :"
echo "  $OUTPUT_DIR/$BIN_NAME"
echo ""
