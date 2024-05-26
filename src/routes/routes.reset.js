'use strict';

const express = require('express');
const { resetController } = require('../controllers/reset.controller');
const { errorWrapper } = require('../middleware/errorWrapper');

const resetRoutes = new express.Router();

resetRoutes.post('/password', errorWrapper(resetController.resetPassword));

resetRoutes.get(
  '/password/:resetToken',
  errorWrapper(resetController.resetPasswordWithToken),
);

resetRoutes.post(
  '/password/:userId',
  errorWrapper(resetController.resetPasswordData),
);

module.exports = {
  resetRoutes,
};
