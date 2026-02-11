import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { catchError } from '../middlewares/catch-error.middleware.js';

export const userRouter = express.Router();

userRouter.get('/', catchError(userController.getProfile));
userRouter.patch('/', catchError(userController.updateName));
userRouter.patch('/password', catchError(userController.updatePassword));

userRouter.post(
  '/change-email',
  catchError(userController.updateEmailNotification),
);
