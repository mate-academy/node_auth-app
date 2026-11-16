import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const profileRouter = express.Router();

profileRouter.patch(
  '/profile/name',
  authMiddleware,
  profileController.changeName,
);

profileRouter.patch(
  '/profile/password',
  authMiddleware,
  profileController.changePassword,
);

profileRouter.patch(
  '/profile/email',
  authMiddleware,
  profileController.changeEmail,
);
