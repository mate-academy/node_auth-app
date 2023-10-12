'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.get('/:id', catchError(userController.getUser));
userRouter.patch('/:id', catchError(userController.update));

userRouter.get('/:id/activation/:activationToken',
  catchError(userController.activate));

module.exports = {
  userRouter,
};
