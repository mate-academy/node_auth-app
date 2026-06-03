import { Router } from 'express';
import { authController } from '../api/auth.controller';

const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/users', authController.getUsers);
authRouter.get('/activation/:email/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);

export default authRouter;
