'use strict';
import express from 'express';
export const authRouter = express.Router();
import {usersController} from '../controllers/users.controller.js'
import passport from 'passport';
import { authLocal } from '../auth_config/local.js';
import { isLoggedIn } from '../utils/isLoggedIn.js';

authRouter.post('/signup', usersController.createUser);
authRouter.post('/login', authLocal, usersController.logIn);
authRouter.get('/check-is-auth', isLoggedIn, usersController.getAuthUser);
authRouter.get('/logout', usersController.logOut);
authRouter.get('/verify-email', usersController.verify);
authRouter.get('/resend-email', isLoggedIn, usersController.resendEmail);
authRouter.post('/reset-password', usersController.resetPassword);
authRouter.post('/set-new-password', usersController.setNewPassword);


