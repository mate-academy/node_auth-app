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
profileRouter.get('/profile', catchError(profileController.getProfile));
profileRouter.patch('/profile/name', catchError(profileController.changeName));

profileRouter.patch(
  '/profile/email',
  catchError(profileController.changeEmail),
);

profileRouter.patch(
  '/profile/password',
  catchError(profileController.changePassword),
);
