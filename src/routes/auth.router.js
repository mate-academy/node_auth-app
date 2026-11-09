'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:email/:token', authController.activation);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/reset-request', authController.resetRequest);
authRouter.post('/reset-password', authController.resetPassword);

module.exports = { authRouter };
