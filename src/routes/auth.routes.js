const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { ensureGuest, authenticate } = require('../middlewares/authMiddlewares');

router.post('/register', ensureGuest, authController.register);
router.get('/activate/:token', ensureGuest, authController.activate);
router.post('/login', ensureGuest, authController.login);
router.post('/forgot', ensureGuest, authController.forgotPassword);
router.post('/reset/:token', ensureGuest, authController.resetPassword);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;
