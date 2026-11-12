import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { profileController } from './profile.controller.js';

export const profileRouter = Router();

profileRouter.get('/', authMiddleware, profileController.getOwner);
profileRouter.patch('/name', authMiddleware, profileController.changeName);
profileRouter.patch('/password', authMiddleware, profileController.changePassword);
profileRouter.patch('/email', authMiddleware, profileController.changeEmail);

