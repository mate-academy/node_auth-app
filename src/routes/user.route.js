const express = require('express');
const { catchError } = require('../utils/catchError');
const { userController } = require('../controllers/user.controller');
const { authMiddleware } = require('../midlleware/authMiddleware');
const { guestMiddleware } = require('../midlleware/guestMiddleware');

const userRouter = express.Router();

// userRouter.get('/', authMiddleware, catchError(userController.getAllUsers));
userRouter.post(
  '/reset-password',
  guestMiddleware,
  catchError(userController.resetMail),
);

userRouter.post(
  '/reset-email/:resetToken',
  guestMiddleware,
  catchError(userController.reset),
);

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getProfile),
);

userRouter.patch(
  '/profile-name',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.patch(
  '/profile-password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.patch(
  '/profile-email',
  authMiddleware,
  catchError(userController.changeEmail),
);

module.exports = { userRouter };
