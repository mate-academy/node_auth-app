'use strict';

const express = require('express');

const authController = require('../service/auth.controller');

const _require = require('../middleware/guestOnly');
const guestOnly = _require.guestOnly;
const requireAuth = _require.requireAuth;

const router = express.Router();

router.get('/password-rules', authController.getPasswordRules);
router.post('/registration', guestOnly, authController.register);
router.get('/activation/:activationToken', authController.activate);
router.post('/login', guestOnly, authController.login);
router.get('/profile', requireAuth, authController.getProfile);
router.get('/users', requireAuth, authController.getUsers);
router.patch('/patching', requireAuth, authController.patching);
router.patch('/patching/parol', requireAuth, authController.parol);
router.post('/logout', requireAuth, authController.logout);
router.patch('/profile/email', requireAuth, authController.changeEmail);
router.patch('/forgot-pass', authController.changepass);
router.post('/email-sent', authController.sentEmail);
module.exports = router;
