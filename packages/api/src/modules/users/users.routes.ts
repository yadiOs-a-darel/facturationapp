import { Router } from 'express';
import { getMe, updateMe, updatePassword } from './users.controller';
import { authMiddleware } from '../../middleware/auth';

export const usersRouter = Router();

usersRouter.use(authMiddleware);
usersRouter.get('/me', getMe);
usersRouter.put('/me', updateMe);
usersRouter.put('/me/password', updatePassword);
