import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { authRouter } from './modules/auth/auth.routes';
import { tenantRouter } from './modules/tenants/tenants.routes';
import { customersRouter } from './modules/customers/customers.routes';
import { productsRouter } from './modules/products/products.routes';
import { invoicesRouter } from './modules/invoices/invoices.routes';

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

// Sert les fichiers uploads depuis le dossier de l'exécutable
app.use('/uploads', express.static(path.join(appDir, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gestfacturation-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API GestFacturation démarrée sur http://localhost:${PORT}`);
  console.log(`Répertoire: ${appDir}`);
});
