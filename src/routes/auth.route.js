/* eslint-disable max-len */
import express from 'express';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { isGuest } from '../middlewares/guestMiddleware.js';
import { activate, register } from '../controllers/auth/register.controller.js';
import {
  login,
  logout,
  refresh,
} from '../controllers/auth/login.controller.js';
import {
  resetPassword,
  resetRequest,
} from '../controllers/auth/password.controller.js';

export const authRouter = express.Router();

authRouter.post('/registration', isGuest, catchError(register));

authRouter.get('/activation/:activationToken', isGuest, catchError(activate));
authRouter.post('/login', isGuest, catchError(login));
authRouter.get('/refresh', catchError(refresh));
authRouter.post('/logout', authMiddleware, catchError(logout));

authRouter.post('/reset-password', isGuest, catchError(resetRequest));

authRouter.post('/reset-password/:token', isGuest, catchError(resetPassword));
