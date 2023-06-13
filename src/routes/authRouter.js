/* eslint-disable max-len */
'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const { catchError } = require('../utils/catchError');
const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/registration-with-google', catchError(authController.registerWithGoogle));
authRouter.get('/activation/:activationToken', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/restore-password-email-part', catchError(authController.restorePasswordEmailPart));
authRouter.post('/check-restore-code', catchError(authController.checkRestoreCode));
authRouter.post('/change-password', catchError(authController.changePassword));

module.exports = authRouter;
