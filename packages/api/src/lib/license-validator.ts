import crypto from 'crypto';

function getLicenseSecret(): string {
  return process.env.LICENSE_SECRET || 'dev-license-secret-change-me';
}

/**
 * Génère une clé de licence signée avec HMAC-SHA256
 * Format: uuid.signature
 */
export function generateLicenseKey(): string {
  const uuid = crypto.randomUUID();
  const signature = crypto
    .createHmac('sha256', getLicenseSecret())
    .update(uuid)
    .digest('hex');

  return `${uuid}.${signature}`;
}

/**
 * Valide une clé de licence
 * Vérifie que la signature correspond à l'UUID
 */
export function validateLicenseKey(licenseKey: string): boolean {
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
    .createHmac('sha256', getLicenseSecret())
    .update(uuid)
    .digest('hex');

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  } catch {
    return false;
  }
}

/**
 * Extrait l'UUID d'une clé de licence
 */
export function extractUuidFromLicense(licenseKey: string): string | null {
  if (!licenseKey) return null;
  const parts = licenseKey.split('.');
  return parts[0] || null;
}
