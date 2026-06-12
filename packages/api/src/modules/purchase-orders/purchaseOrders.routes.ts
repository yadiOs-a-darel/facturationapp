import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  receivePurchaseOrder,
} from './purchaseOrders.controller';

export const purchaseOrdersRouter = Router();
purchaseOrdersRouter.use(authMiddleware);
purchaseOrdersRouter.get('/', listPurchaseOrders);
purchaseOrdersRouter.get('/:id', getPurchaseOrder);
purchaseOrdersRouter.post('/', requireAdmin, createPurchaseOrder);
purchaseOrdersRouter.post('/:id/receive', requireAdmin, receivePurchaseOrder);
