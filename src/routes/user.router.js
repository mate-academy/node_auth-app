'use strict';

const express = require('express');
const { userController } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const userRouter = express.Router();

userRouter.get('/', authMiddleware, userController.getProfile);
userRouter.patch('/name', authMiddleware, userController.updateName);
userRouter.patch('/password', authMiddleware, userController.updatePassword);
userRouter.patch('/email', authMiddleware, userController.requestEmailChange);

userRouter.get(
  '/email/confirm/:email/:token',
  userController.confirmEmailChange,
);

module.exports = {
  userRouter,
};
