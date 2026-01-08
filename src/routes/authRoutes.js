'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const { requireAuth, requireGuest } = require('../middleware/authMiddleware');

router.get('/register', requireGuest, authController.getRegisterPage);
router.post('/register', requireGuest, authController.register);

router.get('/activate/:token', requireGuest, authController.activateAcount);

router.get('/profile', requireAuth, async (req, res) => {
  const { models } = require('../models');

  if (!req.session.userId) {
    return res.redirect('/register');
  }

  const user = await models.User.findByPk(req.session.userId);

  res.render('profile', { user });
});

router.get('/login', requireGuest, authController.getLoginPage);
router.post('/login', requireGuest, authController.login);

router.post('/logout', requireAuth, (req, res) => {
  req.session = null;
  res.redirect('/login');
});

router.get('/reset-password', requireGuest, authController.getRequestResetPage);

router.post(
  '/reset-password',
  requireGuest,
  authController.requestPasswordReset,
);

router.get(
  '/reset-password/:token',
  requireGuest,
  authController.getResetPasswordPage,
);

router.post(
  '/reset-password/:token',
  requireGuest,
  authController.resetPassword,
);

router.post('/profile/name', requireAuth, authController.updadeName);
router.post('/profile/password', requireAuth, authController.updatePassword);
router.post('/profile/email', requireAuth, authController.updateEmail);

module.exports = {
  router,
};
