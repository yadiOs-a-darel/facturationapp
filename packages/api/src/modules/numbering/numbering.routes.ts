import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import { listNumberingConfigs, updateNumberingConfig } from './numbering.controller';

export const numberingRouter = Router();
numberingRouter.use(authMiddleware);
numberingRouter.get('/', listNumberingConfigs);
numberingRouter.put('/:id', requireAdmin, updateNumberingConfig);
