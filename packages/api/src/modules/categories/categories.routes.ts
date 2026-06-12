import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller';

export const categoriesRouter = Router();
categoriesRouter.use(authMiddleware);
categoriesRouter.get('/', listCategories);
categoriesRouter.post('/', requireAdmin, createCategory);
categoriesRouter.put('/:id', requireAdmin, updateCategory);
categoriesRouter.delete('/:id', requireAdmin, deleteCategory);
