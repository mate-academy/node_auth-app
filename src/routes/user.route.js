const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const { catchError } = require('../middleware/catchMiddleware.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllNotActive));

userRouter.post(
  '/changeName/:name',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.post(
  '/changePassword/:name',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.post(
  '/changeEmail/:name',
  authMiddleware,
  catchError(userController.changeEmail),
);

userRouter.get(
  '/confirmation/:email/:resetToken',
  catchError(userController.activationNewEmail),
);

module.exports = { userRouter };
