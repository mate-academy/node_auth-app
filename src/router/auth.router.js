const express = require('express');
const authController = require('./../controller/auth.controller.js');

const router = express.Router();

router.post('/auth', authController.register);
router.get('/activate/:activationToken', authController.activate);
router.post('/login', authController.loginUser);
router.get('/refresh', authController.refresh);
router.get('/logout', authController.logout);
router.post('/password-reset/:resetToken', authController.resetPassword);
router.post('/forgot', authController.forgotPassword);

module.exports = router;
