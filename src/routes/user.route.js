const express = require('express');
const userController = require('../controllers/user.controller.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', catchError(userController.getAllActivated));
userRouter.patch('/update-name', catchError(userController.updateName));
userRouter.patch('/change-password', catchError(userController.changePassword));
userRouter.patch('/change-email', catchError(userController.changeEmail));

module.exports = { userRouter };
