import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = new express.Router();

router.post('/register', catchError(authController.register));
router.get('/activate/:activationToken', catchError(authController.activate));
router.post('/login', catchError(authController.login));
router.get('/refresh', catchError(authController.refresh));
router.get('/logout', catchError(authController.logout));
router.post('/request-reset', catchError(authController.requestResetPassword));
router.post('/reset/:token', catchError(authController.resetPassword));
