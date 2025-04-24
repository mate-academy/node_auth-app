const express = require('express');
const { isGuest } = require('../middlewares/isGuestMiddleware.js');
const {
  resetPassController,
} = require('../controllers/resetPass.controller.js');

const resetPassRoute = new express.Router();

resetPassRoute.post('/reset', isGuest, resetPassController.generateToken);

resetPassRoute.put(
  '/reset/:resetToken',
  isGuest,
  resetPassController.updatePass,
);

module.exports = { resetPassRoute };
