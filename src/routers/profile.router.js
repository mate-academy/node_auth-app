import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import profileController from '../controllers/profile.controller.js';
import cookieParser from 'cookie-parser';

export const profileRouter = express.Router();

profileRouter.use(authMiddleware);
profileRouter.use(cookieParser());

profileRouter.get('/', (req, res) => {
  res.send('Profile page');
});

profileRouter.patch('/change-name', catchError(profileController.changeName));

profileRouter.post(
  '/request-email-change',
  catchError(profileController.requestChangeEmail),
);

profileRouter.get(
  '/change-email/:activationToken',
  catchError(profileController.changeEmail),
);

profileRouter.patch(
  '/change-password',
  catchError(profileController.changePassword),
);
