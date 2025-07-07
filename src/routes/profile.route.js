import express from 'express';

import { profileController } from '../controllers/profile.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.post(
  '/changeName',

  authMiddleware,

  catchError(profileController.changeName),
);

profileRouter.post(
  '/changePassword',

  authMiddleware,

  catchError(profileController.changePassword),
);

profileRouter.post(
  '/changeEmail',

  authMiddleware,

  catchError(profileController.changeEmail),
);
