import express from 'express';

import { catchError } from '../utils/catchError.js';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const profileRouter = express.Router();

profileRouter.patch(
  '/name',
  authMiddleware,
  catchError(profileController.changeName),
);

profileRouter.patch(
  '/password',
  authMiddleware,
  catchError(profileController.changePassword),
);

profileRouter.patch(
  '/email',
  authMiddleware,
  catchError(profileController.changeEmail),
);

profileRouter.get(
  '/accounts',
  authMiddleware,
  catchError(profileController.getProfile),
);

profileRouter.delete(
  '/accounts/:provider',
  authMiddleware,
  catchError(profileController.removeSocialAccount),
);

profileRouter.post(
  '/accounts/:provider',
  authMiddleware,
  catchError(profileController.addSocialAccount),
);
