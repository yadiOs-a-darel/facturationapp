import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from './paymentMethods.controller';

export const paymentMethodsRouter = Router();

paymentMethodsRouter.use(authMiddleware);

paymentMethodsRouter.get('/', listPaymentMethods);
paymentMethodsRouter.post('/', createPaymentMethod);
paymentMethodsRouter.put('/:id', updatePaymentMethod);
paymentMethodsRouter.delete('/:id', deletePaymentMethod);

