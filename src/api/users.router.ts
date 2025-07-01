import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const usersRouter = Router();

usersRouter.get('/', authMiddleware, usersController.getAll);
