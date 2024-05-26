'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { profileController } = require('../controllers/profile.controller');
const { errorWrapper } = require('../middleware/errorWrapper');

const profileRoutes = new express.Router();

profileRoutes.get(
  '/:userId',
  errorWrapper(authController.authenticateToken),
  errorWrapper(profileController.getProfile),
);

module.exports = {
  profileRoutes,
};
