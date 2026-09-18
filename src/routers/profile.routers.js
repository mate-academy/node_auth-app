'use strict';

const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

router.get('/', authMiddleware, profileController.getProfile);
router.patch('/name', authMiddleware, profileController.updateName);
router.patch('/email', authMiddleware, profileController.updateEmail);
router.patch('/password', authMiddleware, profileController.updatePassword);
router.post('/set-password', authMiddleware, profileController.setPassword);

module.exports = router;
