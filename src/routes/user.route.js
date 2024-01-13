'use strict';

const express = require('express');
const userController = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.patch('/:userId', catchError(userController.changeName));
userRouter.patch('/email', catchError(userController.updateEmail));
userRouter.patch('/password', catchError(userController.updatePassword));

module.exports = {
  userRouter,
};
