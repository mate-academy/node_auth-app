import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../midlleware/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/', authMiddleware, userController.getAll);

userRouter.patch(
  '/:userId/settings',
  authMiddleware,
  userController.updateNameOrPassword,
);
userRouter.patch('/:userId/email', authMiddleware, userController.updateEmail);
