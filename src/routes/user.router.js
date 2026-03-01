import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/', authMiddleware, userController.getAll);
userRouter.patch('/profile/name', authMiddleware, userController.updateName);

userRouter.patch(
  '/profile/password',
  authMiddleware,
  userController.changePassword,
);
userRouter.patch('/profile/email', authMiddleware, userController.changeEmail);
