import { Router } from 'express';
import { getMyTenant, updateMyTenantBranding } from './tenants.controller';
import { authMiddleware } from '../../middleware/auth';

export const tenantRouter = Router();

tenantRouter.use(authMiddleware);
tenantRouter.get('/me', getMyTenant);
tenantRouter.put('/me', updateMyTenantBranding);
