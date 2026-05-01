import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { catchError } from '../utils/catchError.js';
import { authController } from '../controllers/auth.controller.js';

export const usersRouter = Router();

usersRouter.get('/', authMiddleware, catchError(authController.getAll));
