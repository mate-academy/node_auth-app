'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleWare = require('../middlewares/auth.middleware');
const catchError = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.patch( // from POST to PATCH
  '/change-name',
  authMiddleWare.authMiddleWare,
  catchError(userController.changeName),
);

userRouter.patch( // from POST to PATCH
  '/change-password',
  authMiddleWare.authMiddleWare,
  catchError(userController.changePass),
);

userRouter.patch( // from POST to PATCH
  '/change-email',
  authMiddleWare.authMiddleWare,
  catchError(userController.changeEmail),
);

module.exports = userRouter;
