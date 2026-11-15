import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRoute = express.Router();

authRoute.post('/registration', authController.register);
authRoute.get('/activation/:activationToken', authController.activate);
