"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLicense = validateLicense;
exports.generateLicense = generateLicense;
const zod_1 = require("zod");
const license_validator_1 = require("../../lib/license-validator");
const validateLicenseSchema = zod_1.z.object({
    licenseKey: zod_1.z.string().min(1),
});
/**
 * Valide une clé de licence
 * POST /api/auth/validate-license
 */
async function validateLicense(req, res) {
    const parse = validateLicenseSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Clé de licence invalide' });
    }
    const { licenseKey } = parse.data;
    if (!(0, license_validator_1.validateLicenseKey)(licenseKey)) {
        return res.status(401).json({
            error: 'Clé de licence invalide',
            valid: false
        });
    }
    // Licence valide
    return res.json({
        valid: true,
        licenseKey,
        message: 'Licence valide'
    });
}
/**
 * Génère une nouvelle clé de licence (pour test/admin)
 * POST /api/auth/generate-license
 * Protégé par SUPER_ADMIN uniquement
 */
async function generateLicense(req, res) {
    const user = req.user;
    // Vérifier que c'est un SUPER_ADMIN
    if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    const licenseKey = (0, license_validator_1.generateLicenseKey)();
    return res.json({
        licenseKey,
        message: 'Clé de licence générée avec succès'
    });
}
