import { Router } from 'express';
import { login, registerTenant } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register-tenant', registerTenant);
