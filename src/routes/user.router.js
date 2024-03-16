'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../middlewares/catchError');

const userRouter = express.Router();

userRouter.patch(
  '/change-username', authMiddleware,
  catchError(userController.changeUsername));

userRouter.patch(
  '/change-password', authMiddleware,
  catchError(userController.changePassword));

userRouter.post(
  '/request-email-change', authMiddleware,
  catchError(userController.requestEmailChange));

userRouter.patch(
  '/change-email', authMiddleware,
  catchError(userController.changeEmail));

userRouter.get('/get-user', authMiddleware,
  catchError(userController.getUserInfo));

userRouter.delete('/', authMiddleware,
  catchError(userController.deleteUser));

userRouter.delete('/account/:accountType', authMiddleware,
  catchError(userController.deleteSocialAccount));

module.exports = { userRouter };
