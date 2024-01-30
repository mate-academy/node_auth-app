'use strict';

const express = require('express');
const { getAllActivated, changePassword, changeEmail } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const { catchError } = require('../utils/catchError');
const userRouter = express.Router();

userRouter.get('/', authMiddleware, catchError(getAllActivated));
userRouter.patch('/change-password', catchError(changePassword));
userRouter.patch('/change-email', catchError(changeEmail));

module.exports = {
  userRouter,
};
