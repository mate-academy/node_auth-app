'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const guards = require('../middlewares/guards');
const rateLimit = require('../middlewares/rateLimit');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/register', guards.guestOnly, authController.showRegister);

router.post(
  '/register',
  guards.guestOnly,
  rateLimit.authLimiter,
  asyncHandler(authController.register),
);
router.get('/register/sent', guards.guestOnly, authController.registerSent);

router.post(
  '/resend-activation',
  guards.guestOnly,
  rateLimit.authLimiter,
  asyncHandler(authController.resendActivation),
);

router.get(
  '/activate/:token',
  guards.guestOnly,
  asyncHandler(authController.activate),
);

router.get('/login', guards.guestOnly, authController.showLogin);

router.post(
  '/login',
  guards.guestOnly,
  rateLimit.authLimiter,
  asyncHandler(authController.login),
);
router.post('/logout', guards.authOnly, asyncHandler(authController.logout));

module.exports = router;
