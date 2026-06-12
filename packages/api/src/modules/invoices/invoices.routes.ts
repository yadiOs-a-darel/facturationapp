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
import {
  sendInvoiceHandler,
  convertToInvoiceHandler,
  createCreditNoteHandler,
  sendInvoiceEmailHandler,
} from './invoices.workflow';
import { createPaymentHandler } from '../payments/payments.controller';

export const invoicesRouter = Router();

invoicesRouter.use(authMiddleware);

invoicesRouter.get('/', listInvoices);
invoicesRouter.get('/:id', getInvoiceById);
invoicesRouter.post('/', createInvoiceHandler);
invoicesRouter.put('/:id', updateInvoiceHandler);
invoicesRouter.post('/:id/send', sendInvoiceHandler);
invoicesRouter.post('/:id/convert', convertToInvoiceHandler);
invoicesRouter.post('/:id/credit-note', createCreditNoteHandler);
invoicesRouter.post('/:id/send-email', sendInvoiceEmailHandler);
invoicesRouter.post('/:id/cancel', cancelInvoiceHandler);
invoicesRouter.delete('/:id', deleteInvoiceHandler);
invoicesRouter.post('/:id/payments', createPaymentHandler);

