import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { profileController } from '../controllers/profile.controller.js';

export const profileRouter = Router();

profileRouter.put(
  '/name',
  authMiddleware,
  catchError(profileController.updateName),
);
profileRouter.put(
  '/password',
  authMiddleware,
  catchError(profileController.updatePassword),
);
profileRouter.put(
  '/email',
  authMiddleware,
  catchError(profileController.updateEmail),
);
