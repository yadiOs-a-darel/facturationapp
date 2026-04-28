import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  listStockMovements,
  listStockAlerts,
  adjustStockHandler,
  getCurrentStock,
} from './stock.controller';

export const stockRouter = Router();

stockRouter.use(authMiddleware);

stockRouter.get('/movements', listStockMovements);
stockRouter.get('/alerts', listStockAlerts);
stockRouter.get('/:productId', getCurrentStock);
stockRouter.post('/adjust', adjustStockHandler);
