import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const router = new express.Router();

router.patch('/me', authMiddleware, catchError(userController.updateFullName));

router.patch(
  '/me/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

router.patch(
  '/me/email',
  authMiddleware,
  catchError(userController.requestEmailChange),
);

router.get(
  '/me/confirm-email-change/:token',
  catchError(userController.confirmEmailChange),
);

export { router as userRouter };
