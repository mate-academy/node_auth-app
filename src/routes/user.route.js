const express = require('express');
const { userController } = require('../controlles/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/:id', authMiddleware, catchError(userController.user));

userRouter.post(
  '/:id/change-name',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.post(
  '/:id/change-password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.post(
  '/:id/change-email',
  authMiddleware,
  catchError(userController.changeEmail),
);

module.exports = {
  userRouter,
};
