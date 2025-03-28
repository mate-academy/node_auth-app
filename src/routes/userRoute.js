const express = require('express');
const userController = require('../controllers/userController.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

module.exports = {
  userRouter,
};
