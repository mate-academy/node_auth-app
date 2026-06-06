import { Router } from 'express';
import { authController } from '../api/auth.controller';
import cookieParser from "cookie-parser";

const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/users', authController.getUsers);
authRouter.get('/activation/:email/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/refresh', cookieParser(), authController.refresh);
authRouter.post('/password-reset', authController.requestPasswordReset);
authRouter.post('/password-reset/:resetToken', authController.resetPassword);

export default authRouter;
