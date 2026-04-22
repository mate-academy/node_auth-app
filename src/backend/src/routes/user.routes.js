'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.get('/me', authMiddleware, userController.me);
userRouter.patch('/me/password', authMiddleware, userController.changePassword);
userRouter.patch('/me/name', authMiddleware, userController.changeName);
userRouter.patch('/me/email', authMiddleware, userController.changeEmail);

userRouter.delete(
  '/me/social-accounts/github',
  authMiddleware,
  userController.removeGithubAccount,
);

module.exports = { userRouter };
