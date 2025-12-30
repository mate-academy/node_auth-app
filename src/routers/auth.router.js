'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:activationToken', authController.activation);
authRouter.post('/login', authController.login);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password-confirm', authController.resetPasswordConfirm);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.patch('/profile', authMiddleware, authController.updateProfile);

module.exports = { authRouter };
