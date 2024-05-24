'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { profileController } = require('../controllers/profile.controller');
const { errorWrapperAsync } = require('../middleware/errorWrapperAsync');

const routeProfile = new express.Router();

routeProfile.get(
  '/:userId',
  errorWrapperAsync(authController.authenticateToken),
  errorWrapperAsync(profileController.getProfile),
);

module.exports = {
  routeProfile,
};
