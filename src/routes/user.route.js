const express = require('express');
const userController = require('../controllers/user.controller.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const catchError = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.get('/:userId', authMiddleware, catchError(userController.getOne));
userRouter.patch('/:userId', authMiddleware, catchError(userController.update));

module.exports = userRouter;
