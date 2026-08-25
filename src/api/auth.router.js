'use strict';

const express = require('express');

const { authController } = require('./auth.controller.js');

const authRouter = express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:email/:token', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/reset-password', authController.requestPasswordReset);
authRouter.post('/reset-password/:token', authController.resetPassword);
authRouter.get('/email-change/:token', authController.confirmEmailChange);

module.exports = { authRouter };
