import { Router } from 'express';
import { loginController } from '../controllers/loginController.js';

export const loginRouter = Router();

loginRouter.post('/login', loginController.login);
