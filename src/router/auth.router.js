const express = require('express');
const authController = require('./../controller/auth.controller.js');
const { authMiddleware } = require('./../middlewares/auth.middleware.js');

const router = express.Router();

router.post('/register', authController.register);
router.get('/activate/:activationToken', authController.activate);
router.post('/login', authController.loginUser);
router.get('/refresh', authController.refresh);
router.get('/logout', authMiddleware, authController.logout);
router.post('/password-reset/:resetToken', authController.resetPassword);
router.post('/forgot', authController.forgotPassword);

module.exports = router;
