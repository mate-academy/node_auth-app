import express from 'express';
import { profileController } from '../controllers/profile.controllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const profileRouter = new express.Router();

profileRouter.use(authMiddleware);

profileRouter.patch('/name', catchError(profileController.changeName));
profileRouter.patch('/password', catchError(profileController.changePassword));
profileRouter.patch('/email', catchError(profileController.changeEmail));
