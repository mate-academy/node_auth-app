import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { profileController } from '../controllers/profile.controller.js';
import { authController } from '../controllers/auth.controller.js';

export const profileRoute = new express.Router();

profileRoute.patch(
  '/update-name',
  authMiddleware,
  profileController.updateName,
);

profileRoute.patch(
  '/update-password',
  authMiddleware,
  profileController.updatePassword,
);

profileRoute.patch(
  '/request-email-change',
  authMiddleware,
  profileController.requestEmailChange,
);

profileRoute.get(
  '/confirm-email-change/:activationToken',
  authController.confirmEmailChange,
);
