'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleWare = require('../middlewares/auth.middleware');
const catchError = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.post(
  '/change-name',
  authMiddleWare.authMiddleWare,
  catchError(userController.changeName),
);

module.exports = userRouter;
