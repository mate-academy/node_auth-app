import { Router } from 'express';
import { usersController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const usersRouter = Router();

usersRouter.get('/', authMiddleware, usersController.getAll);
usersRouter.get('/me', authMiddleware, usersController.getMe);
usersRouter.patch('/me', authMiddleware, usersController.updateProfile);

usersRouter.patch(
  '/me/password',
  authMiddleware,
  usersController.updatePassword,
);

usersRouter.patch(
  '/me/email',
  authMiddleware,
  usersController.requestEmailChange,
);
