import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddlewares } from '../middlewares/authMiddlewares.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/',
  authMiddlewares,
  catchError(userController.getAllActivated),
);

userRouter.patch(
  '/change-name',
  authMiddlewares,
  catchError(userController.changeName),
);

userRouter.post(
  '/change-password',
  authMiddlewares,
  catchError(userController.changePassword),
);

userRouter.post(
  '/change-email',
  authMiddlewares,
  catchError(userController.changeEmail),
);

userRouter.get('/confirm-email', catchError(userController.confirmNewEmail));
userRouter.get('/confirm-finall', catchError(userController.finallConfirm));
