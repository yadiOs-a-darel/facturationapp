import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { listStockMovements, listStockAlerts } from './stock.controller';

export const stockRouter = Router();

stockRouter.use(authMiddleware);

stockRouter.get('/movements', listStockMovements);
stockRouter.get('/alerts', listStockAlerts);

