'use strict';

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, profileController.getProfile);
router.put('/name', requireAuth, profileController.changeName);
router.put('/password', requireAuth, profileController.changePassword);
router.put('/email', requireAuth, profileController.requestEmailChange);

router.get(
  '/confirm-email-change/:token',
  profileController.confirmEmailChange,
);

module.exports = router;
