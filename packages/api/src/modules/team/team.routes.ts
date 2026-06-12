import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import {
  listTeamUsers,
  createTeamUser,
  updateTeamUser,
  deleteTeamUser,
} from './team.controller';

export const teamRouter = Router();
teamRouter.use(authMiddleware);
teamRouter.use(requireAdmin);
teamRouter.get('/', listTeamUsers);
teamRouter.post('/', createTeamUser);
teamRouter.put('/:id', updateTeamUser);
teamRouter.delete('/:id', deleteTeamUser);
