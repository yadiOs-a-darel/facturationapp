import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  listProducts,
  getProductById,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from './products.controller';

export const productsRouter = Router();

productsRouter.use(authMiddleware);

productsRouter.get('/', listProducts);
productsRouter.get('/:id', getProductById);
productsRouter.post('/', createProductHandler);
productsRouter.put('/:id', updateProductHandler);
productsRouter.delete('/:id', deleteProductHandler);

