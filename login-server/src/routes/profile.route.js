import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.use(authMiddleware);

profileRouter.put('/update-name', catchError(profileController.updateName));
profileRouter.put(
  '/update-password',
  catchError(profileController.updatePassword),
);
profileRouter.put('/update-email', catchError(profileController.updateEmail));
