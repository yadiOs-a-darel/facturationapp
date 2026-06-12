import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  listRecurring,
  createRecurring,
  runRecurring,
  deleteRecurring,
} from './recurring.controller';

export const recurringRouter = Router();
recurringRouter.use(authMiddleware);
recurringRouter.get('/', listRecurring);
recurringRouter.post('/', requireAdmin, createRecurring);
recurringRouter.post('/:id/run', requireAdmin, runRecurring);
recurringRouter.delete('/:id', requireAdmin, deleteRecurring);
