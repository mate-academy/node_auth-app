import { Router } from 'express';
import { authController } from '../api/auth.controller';

const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/users', authController.getUsers);

export default authRouter;
