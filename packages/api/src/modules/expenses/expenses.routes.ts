import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from './expenses.controller';

export const expensesRouter = Router();
expensesRouter.use(authMiddleware);
expensesRouter.get('/', listExpenses);
expensesRouter.post('/', createExpense);
expensesRouter.put('/:id', requireAdmin, updateExpense);
expensesRouter.delete('/:id', requireAdmin, deleteExpense);
