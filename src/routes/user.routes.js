/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();

const { userController } = require('../controllers/user.controller');
const {
  authMiddleware,
  guestMiddleware,
} = require('../middlewares/auth.middleware');

router.get('/profile', authMiddleware, userController.profile);
router.patch('/profile/name', authMiddleware, userController.changeName);

router.patch(
  '/profile/password',
  authMiddleware,
  userController.changePassword,
);
router.patch('/profile/email', authMiddleware, userController.changeEmail);
router.post('/logout', authMiddleware, userController.logout);
router.post('/reset', guestMiddleware, userController.resetPassword);

router.post(
  '/reset/:resetToken',
  guestMiddleware,
  userController.resetPasswordConfirm,
);

module.exports = { router };
