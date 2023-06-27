'use strict';

const express = require('express');
const profileController = require('./controllers/profileController.js');
const { authMiddleware } = require('../middlewares/authMiddleware');

const profileRouter = new express.Router();

profileRouter.post(
  '/profile/update-name', authMiddleware, profileController.updateName
);

profileRouter.post(
  '/profile/update-password', authMiddleware, profileController.updatePassword
);

profileRouter.post(
  '/profile/update-email', authMiddleware, profileController.updateEmail
);

module.exports = { profileRouter };
