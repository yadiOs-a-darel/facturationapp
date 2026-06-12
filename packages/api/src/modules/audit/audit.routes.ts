import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import { listAuditLogs } from './audit.controller';

export const auditRouter = Router();
auditRouter.use(authMiddleware);
auditRouter.use(requireAdmin);
auditRouter.get('/', listAuditLogs);
