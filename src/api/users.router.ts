import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as usersController from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const usersRouter = Router();

usersRouter.get('/', authMiddleware, catchError(usersController.getAll));
