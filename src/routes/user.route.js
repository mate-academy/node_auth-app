const express = require('express');
const userController = require('../controllers/user.controller.js');
const { catchError } = require('../utils/catch.error.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');

const userRouter = express.Router();

userRouter.get('/:id', authMiddleware, catchError(userController.getUser));

userRouter.patch('/updateName', catchError(userController.updateName));

userRouter.patch('/updatePassword', catchError(userController.updatePassword));

userRouter.patch('/updateEmail', catchError(userController.updateEmail));

userRouter.patch(
  '/updateEmail-confirm/:newEmail',
  catchError(userController.updateEmailConfirm),
);

module.exports = {
  userRouter,
};
