'use strict';

const express = require('express');
const { resetController } = require('../controllers/reset.controller');
const { errorWrapperAsync } = require('../middleware/errorWrapperAsync');

const routeReset = new express.Router();

routeReset.post('/password', errorWrapperAsync(resetController.resetPassword));

routeReset.get(
  '/password/:resetToken',
  errorWrapperAsync(resetController.resetPasswordWithToken),
);

routeReset.post(
  '/password/:resetToken',
  errorWrapperAsync(resetController.resetPasswordData),
);

module.exports = {
  routeReset,
};
