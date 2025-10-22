const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware.js');
const { onlyGuest } = require('../middleware/onlyGuest.js');
const router = express.Router();

router.post('/sign-up', onlyGuest, authController.createUser);
router.get('/activate/:token', onlyGuest, authController.activateAccount);
router.post('/login', onlyGuest, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/forgot-password', onlyGuest, authController.forgotPassword);
router.post('/reset-password/:token', onlyGuest, authController.resetPassword);

module.exports = router;
