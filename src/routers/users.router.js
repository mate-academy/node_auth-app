import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { catchError } from '../utils/catchError.js';

export const usersRouter = Router();

usersRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(usersController.getAllUsers),
);
