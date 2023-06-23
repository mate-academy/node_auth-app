import express from 'express';
import { authConroller } from '../controllers/authController.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authConroller.register));
authRouter.post('/registration-with-google', catchError(authConroller.registerWithGoogle));

authRouter.get('/activation/:activationToken', catchError(authConroller.activate));

authRouter.post('/login', catchError(authConroller.login));
authRouter.get('/logout', catchError(authConroller.logout));
authRouter.get('/refresh', catchError(authConroller.refresh));
authRouter.post('/restore-password-email-part', catchError(authConroller.restorePasswordEmailPart));
authRouter.post('/check-restore-code', catchError(authConroller.checkRestoreCode));
authRouter.post('/change-password', catchError(authConroller.changePassword));
