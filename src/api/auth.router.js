'use strict';

const express = require('express');
const { authController } = require('./auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { guestMiddleware } = require('../middleware/guest.middleware');

const router = express.Router();

router.post('/register', guestMiddleware, authController.register);
router.post('/activate', guestMiddleware, authController.activate);
router.post('/login', guestMiddleware, authController.login);
router.post('/logout', authMiddleware, authController.logout);

router.post(
  '/password-reset/request',
  guestMiddleware,
  authController.requestPasswordReset,
);

router.post(
  '/password-reset/confirm',
  guestMiddleware,
  authController.confirmPasswordReset,
);

router.get(
  '/password-reset/sent',
  guestMiddleware,
  authController.getResetEmailSentPage,
);

router.get(
  '/password-reset/success',
  guestMiddleware,
  authController.getResetSuccessPage,
);

module.exports = {
  authRouter: router,
};
