import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.get(
  '/',
  authMiddleware,
  catchError(profileController.getAllInfo),
);

profileRouter.get(
  '/profile',
  authMiddleware,
  catchError(profileController.getProfile),
);

profileRouter.patch(
  '/profile/name',
  authMiddleware,
  catchError(profileController.changeName),
);

profileRouter.patch(
  '/profile/email',
  authMiddleware,
  catchError(profileController.changeEmail),
);

profileRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(profileController.changePassword),
);
