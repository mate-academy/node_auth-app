import express from 'express';
import { authController } from './../controllers/auth.contoller.js';
export const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:email/:token', authController.activate);
authRouter.post('/login', authController.login);
