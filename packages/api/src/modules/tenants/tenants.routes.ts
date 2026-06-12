import { Router } from 'express';
import { getMyTenant, updateMyTenant, uploadTenantLogo } from './tenants.controller';
import { authMiddleware } from '../../middleware/auth';
import { logoUpload } from '../../lib/upload';

export const tenantRouter = Router();

tenantRouter.use(authMiddleware);
tenantRouter.get('/me', getMyTenant);
tenantRouter.put('/me', updateMyTenant);
tenantRouter.post('/me/logo', (req, res, next) => {
  logoUpload.single('logo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    return next();
  });
}, uploadTenantLogo);
