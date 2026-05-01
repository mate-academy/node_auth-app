import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { catchError } from '../utils/catchError.js';
import { profileController } from '../controllers/profile.controller.js';

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', catchError(profileController.getProfile));
profileRouter.patch('/name', catchError(profileController.updateName));
profileRouter.patch('/password', catchError(profileController.updatePassword));
profileRouter.patch('/email', catchError(profileController.updateEmail));
