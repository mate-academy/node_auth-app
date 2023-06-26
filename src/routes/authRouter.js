'use strict';

const express = require('express');
const { authController } = require('./controllers/authController.js');

const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/refresh', authController.refresh());
authRouter.post('/restore', authController.sendRestorePasswordLink);

authRouter.post(
  '/restore/:restorePasswordToken', authController.checkRestoreCode
);
authRouter.post('/change-password', authController.changePassword);

module.exports = { authRouter };
