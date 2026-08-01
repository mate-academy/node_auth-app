const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.post('/name', authMiddleware, catchError(userController.updateName));

userRouter.post(
  '/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.post(
  '/email',
  authMiddleware,
  catchError(userController.requestEmailChange),
);

userRouter.get(
  '/email/confirm/:emailChangeToken',
  catchError(userController.confirmEmailChange),
);

module.exports = { userRouter };
