import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authMiddlewareWithUser } from '../middlewares/auth.middleware.js';

export const profileRouter = Router();

profileRouter.use(authMiddlewareWithUser);

profileRouter.get('/', profileController.getProfile);
profileRouter.put('/name', profileController.updateName);
profileRouter.put('/password', profileController.updatePassword);
profileRouter.put('/email', profileController.updateEmail);
