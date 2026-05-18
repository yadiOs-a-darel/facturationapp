import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  listInvoices,
  getInvoiceById,
  createInvoiceHandler,
  updateInvoiceHandler,
  deleteInvoiceHandler,
  cancelInvoiceHandler,
} from './invoices.controller';
import { createPaymentHandler } from '../payments/payments.controller';

export const invoicesRouter = Router();

invoicesRouter.use(authMiddleware);

invoicesRouter.get('/', listInvoices);
invoicesRouter.get('/:id', getInvoiceById);
invoicesRouter.post('/', createInvoiceHandler);
invoicesRouter.put('/:id', updateInvoiceHandler);
invoicesRouter.post('/:id/cancel', cancelInvoiceHandler);
invoicesRouter.delete('/:id', deleteInvoiceHandler);
invoicesRouter.post('/:id/payments', createPaymentHandler);

