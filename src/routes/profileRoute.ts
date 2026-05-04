import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';

export const profileRouter = Router();

profileRouter.patch('/profile/name', profileController.updateName);
profileRouter.patch('/profile/password', profileController.updatePassword);
profileRouter.patch('/profile/email', profileController.updateEmail);
