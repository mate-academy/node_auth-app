import express from 'express';

import { authMiddleware } from '../middlewares/authMiddleware.js';

import { profileController } from '../controllers/profile.controller.js';

import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.get(
  '/profile',
  authMiddleware,
  catchError(profileController.getProfile),
);

profileRouter.put(
  '/change-name',
  authMiddleware,
  catchError(profileController.changeName),
);

profileRouter.put(
  '/change-password',
  authMiddleware,
  profileController.changePassword,
);

profileRouter.put(
  '/change-email',
  authMiddleware,
  profileController.changeEmail,
);
