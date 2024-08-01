const express = require('express');
const { userController } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

module.exports = { userRouter };
