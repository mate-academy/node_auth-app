import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.get('/', authController.auth);

authRouter.post('/register', authController.register);
