import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  cashierDailyReport,
  emailCashierDailyReport,
} from './cashier-daily.controller';
import {
  dashboardReport,
  salesReport,
  vatReport,
  receivablesReport,
  exportSalesCsv,
} from './reports.controller';

export const reportsRouter = Router();

reportsRouter.use(authMiddleware);

reportsRouter.get('/dashboard', dashboardReport);
reportsRouter.get('/sales', salesReport);
reportsRouter.get('/vat', vatReport);
reportsRouter.get('/receivables', receivablesReport);
reportsRouter.get('/export/sales', exportSalesCsv);
reportsRouter.get('/cashier-daily', requireAdmin, cashierDailyReport);
reportsRouter.post('/cashier-daily/email', requireAdmin, emailCashierDailyReport);

