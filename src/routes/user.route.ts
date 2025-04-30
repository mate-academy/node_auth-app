import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRoute = Router();

userRoute.post('/change-name', userController.changeName);
userRoute.post('/change-password', userController.changePassword);
