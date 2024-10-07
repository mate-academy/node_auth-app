import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.get(
  '/',
  authMiddleware,
  catchError(profileController.getProfile),
);

profileRouter.patch(
  '/newName',
  authMiddleware,
  catchError(profileController.changeUserName),
);

profileRouter.patch(
  '/newEmail',
  authMiddleware,
  catchError(profileController.changeUserEmail),
);

profileRouter.patch(
  '/newPassword',
  authMiddleware,
  catchError(profileController.changeUserPass),
);
