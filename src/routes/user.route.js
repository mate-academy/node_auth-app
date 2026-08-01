import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.post('/name', authMiddleware, catchError(userController.updateName));

userRouter.post(
  '/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.post(
  '/email',
  authMiddleware,
  catchError(userController.requestEmailChange),
);

userRouter.get(
  '/email/confirm/:emailChangeToken',
  catchError(userController.confirmEmailChange),
);
