import { Router } from 'express';
import { authController } from '../controllers/auth.controler.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
