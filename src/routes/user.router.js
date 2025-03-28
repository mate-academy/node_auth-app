'use strict';

const express = require('express');
const { userController } = require('../controllers/user.controller');
const { catchError } = require('../middlewares/catchError');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAllUsers)
);

module.exports = { userRouter };
