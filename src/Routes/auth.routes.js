const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');

router.post('/register', authController.register);
router.get('/activate/:token', authController.activate);
router.post('/login', authController.login);
router.get('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotpassword);
router.post('/reset-password', authController.resetpassword);

module.exports = router;
