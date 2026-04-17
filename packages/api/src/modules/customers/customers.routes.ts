import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  listCustomers,
  getCustomerById,
  createCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
} from './customers.controller';

export const customersRouter = Router();

customersRouter.use(authMiddleware);

customersRouter.get('/', listCustomers);
customersRouter.get('/:id', getCustomerById);
customersRouter.post('/', createCustomerHandler);
customersRouter.put('/:id', updateCustomerHandler);
customersRouter.delete('/:id', deleteCustomerHandler);

