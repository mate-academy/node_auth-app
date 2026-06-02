import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const userRouter = express.Router();

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getOneActivated),
);

userRouter.patch(
  '/profile/name/change',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.patch(
  '/profile/password/change',
  authMiddleware,
  catchError(userController.changePasswordAuthenticated),
);

userRouter.patch(
  '/profile/email/change',
  authMiddleware,
  catchError(userController.changeEmail),
);

userRouter.get(
  '/profile/email/change/activation/:emailChangeToken',
  guestMiddleware,
  catchError(userController.activateChangedEmail),
);

userRouter.post('/logout', authMiddleware, catchError(userController.logout));
