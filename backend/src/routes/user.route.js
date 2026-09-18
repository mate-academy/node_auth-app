const express = require('express');
const { userController } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.get(
  '/profile/:userId',
  authMiddleware,
  catchError(userController.getUserById),
);

userRouter.post(
  '/change',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.patch(
  '/change-name/:userId',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.patch(
  '/change-email/:userId',
  authMiddleware,
  catchError(userController.changeEmail),
);

module.exports = { userRouter };
