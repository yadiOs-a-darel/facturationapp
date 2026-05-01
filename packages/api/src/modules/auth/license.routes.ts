import { Router } from 'express';
import { validateLicense, generateLicense } from './license.controller';
import { authMiddleware } from '../../middleware/auth';

export const licenseRouter = Router();

// Valider une licence (public - avant authentification)
licenseRouter.post('/validate-license', validateLicense);

// Générer une licence (protégé - SUPER_ADMIN uniquement)
licenseRouter.post('/generate-license', authMiddleware, generateLicense);
