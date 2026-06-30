'use strict';

const express = require('express');
const { userController } = require('../controllers/User.controller');
const userRouter = express.Router();
const { authMiddleware } = require('../Middlewares/user.middleware');

userRouter.post('/register', userController.register);
userRouter.get('/auth/activation/:email/:token', userController.activation);
userRouter.post('/login', userController.login);
userRouter.get('/refresh', userController.refresh);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.post('/reset-password', userController.resetPassword);

userRouter.patch(
  '/profile/update',
  authMiddleware,
  userController.updateProfile,
);

module.exports = { userRouter };
