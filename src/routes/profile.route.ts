import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { profileController } from '../controllers/profile.controller.js';

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.get);
profileRouter.patch('/name', profileController.changeName);
profileRouter.patch('/password', profileController.changePassword);
profileRouter.patch('/email', profileController.changeEmail);
