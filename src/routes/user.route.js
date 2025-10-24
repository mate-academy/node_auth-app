const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.get('/me', authMiddleware, catchError(userController.getProfile));

userRouter.patch(
  '/me',
  authMiddleware,
  catchError(userController.updateProfile),
);
