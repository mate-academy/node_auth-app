'use strict';

const express = require('express');
const profileController = require('./controllers/profileController.js');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const profileRouter = new express.Router();

profileRouter.post(
  '/update-name/:userId',
  catchError(authMiddleware),
  catchError(profileController.updateName)
);

profileRouter.post(
  '/update-password/:userId',
  catchError(authMiddleware),
  catchError(profileController.updatePassword)
);

profileRouter.post(
  '/update-email/:userId',
  catchError(authMiddleware),
  catchError(profileController.updateEmail)
);

module.exports = { profileRouter };
