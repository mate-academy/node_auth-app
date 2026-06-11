'use strict';

const { Router } = require('express');
const { authController } = require('./auth.controller.js');

const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:email/:token', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/reset', authController.requestPasswordReset);
authRouter.post('/reset/:token', authController.resetPassword);
authRouter.get('/confirm-email/:email/:token', authController.confirmEmail);

module.exports = { authRouter };
