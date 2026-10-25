'use strict';

const express = require('express');
const controller = require('../controllers/passwordResetController');
const guards = require('../middlewares/guards');
const rateLimit = require('../middlewares/rateLimit');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/password-reset', guards.guestOnly, controller.showRequest);

router.post(
  '/password-reset',
  guards.guestOnly,
  rateLimit.authLimiter,
  asyncHandler(controller.request),
);
router.get('/password-reset/sent', guards.guestOnly, controller.sent);
router.get('/password-reset/success', guards.guestOnly, controller.success);

router.get(
  '/password-reset/:token',
  guards.guestOnly,
  asyncHandler(controller.showForm),
);

router.post(
  '/password-reset/:token',
  guards.guestOnly,
  rateLimit.authLimiter,
  asyncHandler(controller.reset),
);

module.exports = router;
