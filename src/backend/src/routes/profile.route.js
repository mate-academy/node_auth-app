import express from 'express';
import { catchError } from '../utils/catchError.js'
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const profileRouter = new express.Router();

profileRouter.patch('/name', authMiddleware, catchError(profileController.changeName));
profileRouter.patch('/password', authMiddleware, catchError(profileController.changePassword));
profileRouter.patch('/email', authMiddleware, catchError(profileController.requestEmailChange));
profileRouter.get('/confirm-email-change/:emailChangeToken', catchError(profileController.confirmEmailChange));
