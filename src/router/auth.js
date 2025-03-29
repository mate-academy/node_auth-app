import express from 'express';
import { authController } from '../controller/index.js';

const authRouter = new express.Router();

authRouter.post('/registration', authController.registration);
authRouter.get('/activate/:activationToken', authController.activateUser);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/refresh', authController.refresh);

export default authRouter;
