const express = require('express');
const { userController } = require('../controllers/userController.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../middlewares/catchError.js');

const userRouter = new express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAll),
);

userRouter.patch(
  '/change-name',
  catchError(authMiddleware),
  catchError(userController.changeName),
);

userRouter.patch(
  '/change-password',
  catchError(authMiddleware),
  catchError(userController.changePassword),
);

userRouter.post(
  '/change-email',
  catchError(authMiddleware),
  catchError(userController.changeEmailRequest),
);

userRouter.patch(
  '/change-email/:activationToken',
  catchError(authMiddleware),
  catchError(userController.changeEmail),
);

module.exports = { userRouter };
