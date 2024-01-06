'use strict';

import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import {catchError} from "../utils/catchError.js";

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.get('/activation/:activationToken', authController.activate);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/reset', catchError(authController.resetLink));
authRouter.post('/reset/:resetToken', catchError(authController.resetPassword));
