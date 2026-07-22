'use strict';

const express = require('express');

const { authController } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh', authController.refresh);
authRouter.get('/me', authController.me);
authRouter.get('/activate/:token', authController.activate);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password/:token', authController.resetPassword);

module.exports = { authRouter };
