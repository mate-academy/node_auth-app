import { Router } from 'express';
import { authController } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.get('/activate/:token', authController.activate);
authRouter.post('/registration', authController.registration);
