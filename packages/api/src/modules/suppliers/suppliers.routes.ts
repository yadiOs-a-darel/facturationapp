import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from './suppliers.controller';

export const suppliersRouter = Router();
suppliersRouter.use(authMiddleware);
suppliersRouter.get('/', listSuppliers);
suppliersRouter.post('/', requireAdmin, createSupplier);
suppliersRouter.put('/:id', requireAdmin, updateSupplier);
suppliersRouter.delete('/:id', requireAdmin, deleteSupplier);
