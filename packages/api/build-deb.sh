#!/bin/bash
#
# Script de build du package .deb pour GestFacturation API
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR"
DEB_DIR="$API_DIR/deb-package"
OUTPUT_DIR="$API_DIR/deb-output"
PACKAGE_NAME="gesfacturation-api"
VERSION="0.1.0"

echo "=========================================="
echo "  Build du package .deb GestFacturation"
echo "=========================================="
echo ""

# Nettoyer l'ancien build
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Étape 1: Build du code TypeScript
echo "=> Build du code TypeScript..."
cd "$API_DIR"
if [ -f "package.json" ]; then
    npm run build 2>/dev/null || npx tsc -p tsconfig.json
    echo "✓ Code TypeScript compilé"
else
    echo "ERREUR: package.json non trouvé dans $API_DIR"
    exit 1
fi

# Étape 2: Copier le code compilé
echo "=> Copie des fichiers..."
cp -r "$API_DIR/dist" "$DEB_DIR/opt/gesfacturation/"

# Étape 3: Copier les dépendances node
# On copie node_modules entier pour avoir toutes les dépendances résolues
if [ -d "$API_DIR/node_modules" ]; then
    cp -r "$API_DIR/node_modules" "$DEB_DIR/opt/gesfacturation/"
    echo "✓ Dépendances copiées"
else
    echo "ATTENTION: node_modules non trouvé, exécution de npm install..."
    cd "$API_DIR"
    npm install --production
    cp -r "$API_DIR/node_modules" "$DEB_DIR/opt/gesfacturation/"
fi

# Étape 4: Copier le .env.example
cp "$DEB_DIR/opt/gesfacturation/.env.example" "$DEB_DIR/opt/gesfacturation/.env" 2>/dev/null || true

# Étape 5: Copier le package.json (pour référence)
cp "$API_DIR/package.json" "$DEB_DIR/opt/gesfacturation/"

# Étape 6: Copier le prisma schema et database package
DATABASE_DIR="$SCRIPT_DIR/../database"
if [ -d "$DATABASE_DIR" ]; then
    # Supprimer l'ancien package database s'il existe
    rm -rf "$DEB_DIR/opt/gesfacturation/node_modules/@gestfacturation/database"

    # Copier uniquement les fichiers nécessaires de database
    mkdir -p "$DEB_DIR/opt/gesfacturation/node_modules/@gestfacturation/database"
    cp -r "$DATABASE_DIR"/src "$DEB_DIR/opt/gesfacturation/node_modules/@gestfacturation/database/" 2>/dev/null || true
    cp "$DATABASE_DIR/package.json" "$DEB_DIR/opt/gesfacturation/node_modules/@gestfacturation/database/" 2>/dev/null || true

    # Copier les dépendances de database
    if [ -d "$DATABASE_DIR/node_modules" ]; then
        cp -r "$DATABASE_DIR/node_modules"/* "$DEB_DIR/opt/gesfacturation/node_modules/" 2>/dev/null || true
    fi
    echo "✓ Package database inclus"
fi

# Copier le schema Prisma
if [ -f "$DATABASE_DIR/prisma/schema.prisma" ]; then
    mkdir -p "$DEB_DIR/opt/gesfacturation/prisma"
    cp "$DATABASE_DIR/prisma/schema.prisma" "$DEB_DIR/opt/gesfacturation/prisma/"
fi

# Étape 7: Calculer la taille et préparer le control
echo "=> Préparation du package..."
INSTALLED_SIZE=$(du -sk "$DEB_DIR" | cut -f1)
sed -i "s/^Architecture:.*$/Architecture: all/" "$DEB_DIR/DEBIAN/control"
sed -i "s/^Version:.*$/Version: $VERSION/" "$DEB_DIR/DEBIAN/control"

# Étape 8: Fixer les permissions
echo "=> Configuration des permissions..."
find "$DEB_DIR" -type d -exec chmod 755 {} \;
find "$DEB_DIR" -type f -exec chmod 644 {} \;
chmod +x "$DEB_DIR/DEBIAN/"*
chmod +x "$DEB_DIR/usr/local/bin/gesfacturation"
chmod +x "$DEB_DIR/opt/gesfacturation/dist/index.js"

# Étape 9: Build du .deb
echo "=> Création du fichier .deb..."
cd "$OUTPUT_DIR"
fakeroot dpkg-deb --build "$DEB_DIR" "${PACKAGE_NAME}_${VERSION}_all.deb"

# Résultat
echo ""
echo "=========================================="
echo "  ✓ Build terminé avec succès !"
echo "=========================================="
echo ""
echo "Package créé : $OUTPUT_DIR/${PACKAGE_NAME}_${VERSION}_all.deb"
echo ""
echo "Pour installer :"
echo "  sudo dpkg -i $OUTPUT_DIR/${PACKAGE_NAME}_${VERSION}_all.deb"
echo ""
echo "Pour tester sans installer :"
echo "  sudo dpkg -i --force-all $OUTPUT_DIR/${PACKAGE_NAME}_${VERSION}_all.deb"
echo ""
