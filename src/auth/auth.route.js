const { authMiddleware } = require('../middlewares/auth');
const controller = require('./auth.controller');
const express = require('express');

const router = express.Router();

router.post('/register', controller.register);
router.get('/activate', controller.activate);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authMiddleware, controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = { router };
