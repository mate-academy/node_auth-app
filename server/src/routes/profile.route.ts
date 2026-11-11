import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { profileController } from '../controllers/profile.controller';

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.getProfile);
profileRouter.patch('/name', profileController.updateName);
profileRouter.patch('/password', profileController.changePassword);
profileRouter.patch('/email', profileController.changeEmail);
