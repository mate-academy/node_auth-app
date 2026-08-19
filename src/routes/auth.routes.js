const express = require('express');

const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { guestMiddleware } = require('../middlewares/guest.middleware');

const router = express.Router();

router.post('/registration', guestMiddleware, authController.register);

router.get('/activation/:token', guestMiddleware, authController.activate);

router.post('/login', guestMiddleware, authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.post('/forgot-password', guestMiddleware, authController.forgotPassword);

router.post(
  '/reset-password/:token',
  guestMiddleware,
  authController.resetPassword,
);

module.exports = {
  router,
};
