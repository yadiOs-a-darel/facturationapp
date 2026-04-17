import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  listInvoices,
  getInvoiceById,
  createInvoiceHandler,
  updateInvoiceHandler,
  deleteInvoiceHandler,
} from './invoices.controller';
import { createPaymentHandler } from '../payments/payments.controller';

export const invoicesRouter = Router();

invoicesRouter.use(authMiddleware);

invoicesRouter.get('/', listInvoices);
invoicesRouter.get('/:id', getInvoiceById);
invoicesRouter.post('/', createInvoiceHandler);
invoicesRouter.put('/:id', updateInvoiceHandler);
invoicesRouter.delete('/:id', deleteInvoiceHandler);
invoicesRouter.post('/:id/payments', createPaymentHandler);

