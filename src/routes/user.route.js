import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.post(
  '/change_name/:userId',
  authMiddleware,
  catchError(userController.changeName),
);
userRouter.post(
  '/change_password/:userId',
  authMiddleware,
  catchError(userController.changeUserPassword),
);
userRouter.post(
  '/change_email/:userId',
  authMiddleware,
  catchError(userController.changeEmail),
);
