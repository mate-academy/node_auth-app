import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { profileController } from '../controllers/profileController.js';

export const profileRouter = new express.Router();

profileRouter.post(
  '/profile/changeName',
  catchError(authMiddleware),
  catchError(profileController.nameChange),
);

profileRouter.post(
  '/profile/changePassword',
  catchError(authMiddleware),
  catchError(profileController.passwordChange),
);

profileRouter.post(
  '/profile/changeEmail',
  catchError(authMiddleware),
  catchError(profileController.emailChange),
);
