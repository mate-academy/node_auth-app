const { Router } = require('express');
const { catchError } = require('../utils/cathcError.js');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');

const userRouter = Router();

userRouter.post('/forgot-password', catchError(userController.forgotPassword));

userRouter.post(
  '/reset-password/:token',
  catchError(userController.resetPassword),
);

userRouter.patch(
  '/profile/name',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.patch(
  '/profile/email',
  authMiddleware,
  catchError(userController.changeEmail),
);

module.exports = {
  userRouter,
};
