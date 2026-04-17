import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { dashboardReport } from './reports.controller';

export const reportsRouter = Router();

reportsRouter.use(authMiddleware);

reportsRouter.get('/dashboard', dashboardReport);

