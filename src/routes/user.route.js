const express = require('express')
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../middlewares/catchMiddleware.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAll));

userRouter.post(
  '/changeName/:userName',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.post(
  '/changePassword/:userName',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.post(
  '/changeEmail/:userName',
  authMiddleware,
  catchError(userController.changeEmail),
);

userRouter.get(
  '/confirmation/:email/:resetToken',
  catchError(userController.activationNewEmail),
);

module.exports = { userRouter };
