import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { profileController } from '../controllers/profile.controller.js';
import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.get('/', authMiddleware, catchError(profileController.getData));

profileRouter.post(
  '/change-name',
  authMiddleware,
  catchError(profileController.changeName),
);

profileRouter.post(
  '/change-email',
  authMiddleware,
  catchError(profileController.changeEmail),
);

profileRouter.get(
  '/change-email/:confirmToken',
  authMiddleware,
  catchError(profileController.confirmEmail),
);

profileRouter.post(
  '/change-password',
  authMiddleware,
  catchError(profileController.changePassword),
);
