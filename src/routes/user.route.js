const express = require('express');
const authController = require('../controllers/auth.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const catchError = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(authController.activate));

module.exports = { userRouter };
