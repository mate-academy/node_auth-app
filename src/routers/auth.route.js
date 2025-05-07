import express from 'express';
import cookieParser from 'cookie-parser';
import { authController } from '../controllers/auth.controller.js';

export const router = express.Router();

router.post('/registration', authController.register);
router.get('/activate/:email/:token', authController.activation);
router.post('/login', authController.login);
router.post('/refresh', cookieParser(), authController.refresh);
