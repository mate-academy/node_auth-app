'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const { catchError } = require('../middlewares/catchError.middleware');

const userRouter = express.Router();

userRouter.patch('/edit', catchError(userController.edit));
userRouter.patch('/change-password', catchError(userController.changePassword));
userRouter.patch('/change-email', catchError(userController.changeEmail));

module.exports = userRouter;
