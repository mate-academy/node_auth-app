'use strict';

const express = require('express');
const controller = require('../controllers/profileController');
const guards = require('../middlewares/guards');
const rateLimit = require('../middlewares/rateLimit');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/profile', guards.authOnly, controller.show);

router.post(
  '/profile/name',
  guards.authOnly,
  asyncHandler(controller.updateName),
);

router.post(
  '/profile/password',
  guards.authOnly,
  rateLimit.authLimiter,
  asyncHandler(controller.updatePassword),
);

router.post(
  '/profile/email',
  guards.authOnly,
  rateLimit.authLimiter,
  asyncHandler(controller.updateEmail),
);

module.exports = router;
