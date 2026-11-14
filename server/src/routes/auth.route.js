import express from 'express';
import { authControllers } from '../controllers/auth.controller.js';

export const authRoute = express.Router();

authRoute.post('/registration', authControllers.register);
