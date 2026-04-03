'use strict';

const express = require('express');
const { profileController } = require('./profile.controller');

const router = express.Router();

router.get('/', profileController.getProfile);
router.patch('/name', profileController.updateName);
router.patch('/password', profileController.updatePassword);
router.patch('/email', profileController.updateEmail);

module.exports = {
  profileRouter: router,
};
