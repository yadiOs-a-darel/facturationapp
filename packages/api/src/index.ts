import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { authRouter } from './modules/auth/auth.routes';
import { tenantRouter } from './modules/tenants/tenants.routes';
import { usersRouter } from './modules/users/users.routes';
import { customersRouter } from './modules/customers/customers.routes';
import { productsRouter } from './modules/products/products.routes';
import { invoicesRouter } from './modules/invoices/invoices.routes';
import { stockRouter } from './modules/stock/stock.routes';
import { paymentMethodsRouter } from './modules/payment-methods/paymentMethods.routes';
import { reportsRouter } from './modules/reports/reports.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { suppliersRouter } from './modules/suppliers/suppliers.routes';
import { expensesRouter } from './modules/expenses/expenses.routes';
import { purchaseOrdersRouter } from './modules/purchase-orders/purchaseOrders.routes';
import { numberingRouter } from './modules/numbering/numbering.routes';
import { teamRouter } from './modules/team/team.routes';
import { auditRouter } from './modules/audit/audit.routes';
import { recurringRouter } from './modules/recurring/recurring.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { attachmentsRouter } from './modules/attachments/attachments.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';

// Type declaration pour process.pkg (pkg bundler)
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: {
        path: string;
      };
    }
  }
}

// Détermine le répertoire de l'exécutable ou du script
// Compatible avec pkg : process.pkg.path pointe vers le dossier de l'exécutable
const appDir = typeof process.pkg !== 'undefined' && process.pkg?.path
  ? process.pkg.path
  : __dirname;

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());
app.use(morgan('dev'));

// Disable caching for API routes
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Sert les fichiers uploads depuis le dossier de l'exécutable
app.use('/uploads', express.static(path.join(appDir, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gestfacturation-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/users', usersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/stock', stockRouter);
app.use('/api/payment-methods', paymentMethodsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/numbering', numberingRouter);
app.use('/api/team', teamRouter);
app.use('/api/audit', auditRouter);
app.use('/api/recurring-invoices', recurringRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/attachments', attachmentsRouter);
app.use('/api/notifications', notificationsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API GestFacturation démarrée sur http://localhost:${PORT}`);
  console.log(`Répertoire: ${appDir}`);
});
