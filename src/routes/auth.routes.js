/*eslint-disable */
const express = require('express');
const  authController = require('../controllers/auth.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');
const authRouter = new express.Router();

authRouter.post('/register', catchError(authController.register));
authRouter.get('/activation/:activationToken', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword); 
authRouter.post('/update-name', authMiddleware, catchError(authController.updatedName));
authRouter.post('/update-password', authMiddleware, catchError(authController.updatePassword));
authRouter.post('/update-email', authMiddleware, catchError(authController.updateEmail));
authRouter.get('/update-email/:activationToken', catchError(authController.activateUpdatedEmail));

module.exports = {
  authRouter,
};
