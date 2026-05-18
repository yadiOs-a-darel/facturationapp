import { Router } from 'express';
import { login, registerTenant, getSession, logout } from './auth.controller';
import { validateLicense, generateLicense } from './license.controller';
import { authMiddleware } from '../../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register-tenant', registerTenant);
authRouter.post('/validate-license', validateLicense);
authRouter.post('/generate-license', authMiddleware, generateLicense);
authRouter.get('/session', authMiddleware, getSession);
authRouter.post('/logout', authMiddleware, logout);
