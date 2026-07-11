const express = require('express');
const authController = require('../controllers/authController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isNotAuthenticated = require('../middleware/isNotAuthenticated');

const router = express.Router();

// Гостьові роути (доступні тільки НЕ авторизованим)
router.get('/login', isNotAuthenticated, authController.getLoginPage);
router.post('/login', isNotAuthenticated, authController.loginUser);
router.post('/register', isNotAuthenticated, authController.registerUser);
router.get('/register', isNotAuthenticated, authController.getRegisterPage);
router.get('/activate/:token', isNotAuthenticated, authController.activateUser);

// Захищені роути (доступні тільки авторизованим)
router.get('/profile', isAuthenticated, authController.getProfile);
router.get('/logout', isAuthenticated, authController.logoutUser);

module.exports = router;
