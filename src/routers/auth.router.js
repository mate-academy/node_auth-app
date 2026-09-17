const express = require('express');
const authController = require('../controllers/auth.controller');

const passport = require('../utils/passport');

const router = express.Router();

router.post('/register', authController.register);
router.get('/activation/:token', authController.activate);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:resetToken', authController.resetPassword);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['public_profile'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.oauthCallback,
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  authController.oauthCallback,
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  authController.oauthCallback,
);

module.exports = router;
