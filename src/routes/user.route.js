'use strict';

const express = require('express');

const { userController } = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.get('/:userId',
  authMiddleware, catchError(userController.getUserById));

userRouter.put('/change-username/:userId',
  authMiddleware, catchError(userController.changeUsernameById));

userRouter.put('/change-password/:userId',
  authMiddleware, catchError(userController.changePassword));

userRouter.put('/change-email/:userId',
  authMiddleware, catchError(userController.changeEmail));

module.exports = {
  userRouter,
};
