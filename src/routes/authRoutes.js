const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest, isAuth } = require('../middlewares/authMiddleware');

// Register
router.get('/register', isGuest, authController.getRegister);
router.post('/register', isGuest, authController.postRegister);

// Activation
router.get('/activate/:token', isGuest, authController.activateAccount);

// Login
router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, authController.postLogin);

// Logout
router.post('/logout', isAuth, authController.logout);

// Reset Password
router.get('/reset-password', isGuest, authController.getResetPassword);
router.post('/reset-password', isGuest, authController.postResetPassword);
router.get('/reset-password/:token', isGuest, authController.getNewPassword);
router.post('/reset-password/:token', isGuest, authController.postNewPassword);

// Profile
router.get('/profile', isAuth, authController.getProfile);
router.post('/profile/name', isAuth, authController.updateName);
router.post('/profile/password', isAuth, authController.updatePassword);
router.post('/profile/email', isAuth, authController.updateEmail);

module.exports = router;
