#!/usr/bin/env node
/**
 * Script de génération de clés de licence pour GestFacturation
 *
 * Usage:
 *   node scripts/generate-license.js              # Génère une clé
 *   node scripts/generate-license.js 5            # Génère 5 clés
 *   node scripts/generate-license.js --help       # Affiche l'aide
 *
 * La variable d'environnement LICENSE_SECRET doit être définie en production.
 * En développement, une valeur par défaut est utilisée.
 */

const crypto = require('crypto');

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'dev-license-secret-change-me';

/**
 * Génère une clé de licence signée avec HMAC-SHA256
 * Format: uuid.signature
 */
function generateLicenseKey() {
  const uuid = crypto.randomUUID();
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(uuid)
    .digest('hex');

  return `${uuid}.${signature}`;
}

/**
 * Valide une clé de licence
 */
function validateLicenseKey(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false;
  }

  const parts = licenseKey.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [uuid, signature] = parts;

  // Vérifier format UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return false;
  }

  // Recalculer la signature
  const expectedSignature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(uuid)
    .digest('hex');

  // Comparer les signatures
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Parse arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Générateur de clés de licence GestFacturation

Usage:
  node scripts/generate-license.js [nombre]

Options:
  --help, -h     Affiche cette aide
  --validate     Valide une clé (suivi de la clé)

Exemples:
  node scripts/generate-license.js        # Génère 1 clé
  node scripts/generate-license.js 10     # Génère 10 clés
  node scripts/generate-license.js --validate <clé>  # Valide une clé
`);
  process.exit(0);
}

// Mode validation
if (args.includes('--validate')) {
  const validateIndex = args.indexOf('--validate');
  const licenseKey = args[validateIndex + 1];

  if (!licenseKey) {
    console.error('Erreur: Clé de licence requise pour validation');
    console.error('Usage: node scripts/generate-license.js --validate <clé>');
    process.exit(1);
  }

  const isValid = validateLicenseKey(licenseKey);
  if (isValid) {
    console.log('✓ Clé de licence VALIDE');
  } else {
    console.log('✗ Clé de licence INVALIDE');
    process.exit(1);
  }
  process.exit(0);
}

// Mode génération
const count = parseInt(args[0], 10) || 1;

if (isNaN(count) || count < 1) {
  console.error('Erreur: Le nombre de clés doit être un entier positif');
  process.exit(1);
}

console.log(`\n=== Génération de ${count} clé(s) de licence GestFacturation ===\n`);
console.log('SECRET UTILISÉ:', LICENSE_SECRET.substring(0, 8) + '...\n');

for (let i = 0; i < count; i++) {
  const licenseKey = generateLicenseKey();
  console.log(`[${i + 1}/${count}] ${licenseKey}`);
}

console.log('\n=== Instructions ===');
console.log('1. Copiez la clé et transmettez-la à l\'utilisateur');
console.log('2. L\'utilisateur devra saisir cette clé sur la page /auth/license');
console.log('3. Après validation, il pourra créer son compte');
console.log('\nPour valider une clé: node scripts/generate-license.js --validate <clé>\n');
