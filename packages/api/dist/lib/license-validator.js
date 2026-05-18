"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLicenseKey = generateLicenseKey;
exports.validateLicenseKey = validateLicenseKey;
exports.extractUuidFromLicense = extractUuidFromLicense;
const crypto_1 = __importDefault(require("crypto"));
function getLicenseSecret() {
    return process.env.LICENSE_SECRET || 'dev-license-secret-change-me';
}
/**
 * Génère une clé de licence signée avec HMAC-SHA256
 * Format: uuid.signature
 */
function generateLicenseKey() {
    const uuid = crypto_1.default.randomUUID();
    const signature = crypto_1.default
        .createHmac('sha256', getLicenseSecret())
        .update(uuid)
        .digest('hex');
    return `${uuid}.${signature}`;
}
/**
 * Valide une clé de licence
 * Vérifie que la signature correspond à l'UUID
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
    const expectedSignature = crypto_1.default
        .createHmac('sha256', getLicenseSecret())
        .update(uuid)
        .digest('hex');
    if (signature.length !== expectedSignature.length) {
        return false;
    }
    try {
        return crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    catch {
        return false;
    }
}
/**
 * Extrait l'UUID d'une clé de licence
 */
function extractUuidFromLicense(licenseKey) {
    if (!licenseKey)
        return null;
    const parts = licenseKey.split('.');
    return parts[0] || null;
}
