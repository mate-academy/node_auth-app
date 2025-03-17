import express from 'express';
import { catchError } from '../utils/catchError.js';
import { profileController } from '../controllers/profile.controller.js';

export const profileRouter = new express.Router();

profileRouter.get('/', catchError(profileController.getProfile));
profileRouter.patch('/change-name', catchError(profileController.updateName));

profileRouter.patch(
  '/change-password',
  catchError(profileController.updatePassword),
);
profileRouter.patch('/change-email', catchError(profileController.changeEmail));
