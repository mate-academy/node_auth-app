'use strict';

const express = require('express');
const profileController = require('./controllers/profileController.js');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const profileRouter = new express.Router();

profileRouter.post(
  '/profile/update-name',
  catchError(authMiddleware),
  catchError(profileController.updateName)
);

profileRouter.post(
  '/profile/update-password',
  catchError(authMiddleware),
  catchError(profileController.updatePassword)
);

profileRouter.post(
  '/profile/update-email',
  catchError(authMiddleware),
  catchError(profileController.updateEmail)
);

module.exports = { profileRouter };
