import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRoute = express.Router();

authRoute.post('/registration', authController.register);
