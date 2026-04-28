import { Router } from 'express';
import { login, registerTenant, getSession, logout } from './auth.controller';
import { authMiddleware } from '../../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register-tenant', registerTenant);
authRouter.get('/session', authMiddleware, getSession);
authRouter.post('/logout', authMiddleware, logout);
