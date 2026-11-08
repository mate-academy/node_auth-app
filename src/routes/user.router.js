'use strict';

const express = require('express');
const { userController } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const userRouter = express.Router();

userRouter.get('/', authMiddleware, userController.getProfile);

module.exports = {
  userRouter,
};
