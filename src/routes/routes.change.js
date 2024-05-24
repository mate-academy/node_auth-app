'use strict';

const express = require('express');
const { changeController } = require('../controllers/change.controller');
const { errorWrapperAsync } = require('../middleware/errorWrapperAsync');
const { authController } = require('../controllers/auth.controller.js');

const routeChange = new express.Router();

routeChange.post(
  '/name/:userId',
  errorWrapperAsync(authController.authenticateToken),
  errorWrapperAsync(changeController.postName),
);

routeChange.post(
  '/email/:userId',
  errorWrapperAsync(authController.authenticateToken),
  errorWrapperAsync(changeController.postEmail),
);

routeChange.post(
  '/password/:userId',
  errorWrapperAsync(authController.authenticateToken),
  errorWrapperAsync(changeController.postPassword),
);

module.exports = {
  routeChange,
};
