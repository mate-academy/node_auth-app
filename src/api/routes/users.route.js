const express = require('express');
const { authController } = require('../controller/auth.controller');
const { catchError } = require('../utils/catchError');
const { authMiddleware } = require('../middlewares/auth.middleware');

const usersRouter = express.Router();

usersRouter.get('/', authMiddleware, catchError(authController.getAll));

module.exports = {
  usersRouter,
};
