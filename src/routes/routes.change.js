'use strict';

const express = require('express');
const { changeController } = require('../controllers/change.controller');
const { errorWrapper } = require('../middleware/errorWrapper');
const { authController } = require('../controllers/auth.controller.js');

const profileUpdateRoutes = new express.Router();
const authenticate = errorWrapper(authController.authenticateToken);

profileUpdateRoutes.post(
  '/name/:userId',
  authenticate,
  errorWrapper(changeController.postName),
);

profileUpdateRoutes.post(
  '/email/:userId',
  authenticate,
  errorWrapper(changeController.postEmail),
);

profileUpdateRoutes.post(
  '/password/:userId',
  authenticate,
  errorWrapper(changeController.postPassword),
);

module.exports = {
  profileUpdateRoutes,
};
