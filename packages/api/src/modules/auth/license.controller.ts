import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { validateLicenseKey, generateLicenseKey } from '../../lib/license-validator';

const validateLicenseSchema = z.object({
  licenseKey: z.string().min(1),
});

/**
 * Valide une clé de licence
 * POST /api/auth/validate-license
 */
export async function validateLicense(req: AuthenticatedRequest, res: Response) {
  const parse = validateLicenseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Clé de licence invalide' });
  }

  const { licenseKey } = parse.data;

  if (!validateLicenseKey(licenseKey)) {
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
export async function generateLicense(req: AuthenticatedRequest, res: Response) {
  const user = req.user;

  // Vérifier que c'est un SUPER_ADMIN
  if (!user || user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const licenseKey = generateLicenseKey();

  return res.json({
    licenseKey,
    message: 'Clé de licence générée avec succès'
  });
}
