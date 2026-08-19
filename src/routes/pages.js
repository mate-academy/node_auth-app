'use strict';

const { Router } = require('express');

function createPagesRouter(controller) {
  const router = Router();

  function guestPage(req, res, next) {
    if (req.user) {
      res.redirect(302, '/profile');

      return;
    }

    next();
  }

  function protectedPage(req, res, next) {
    if (!req.user) {
      res.redirect(302, '/login');

      return;
    }

    next();
  }

  router.get('/', controller.home);
  router.get('/register', guestPage, controller.showRegister);
  router.post('/register', guestPage, controller.register);
  router.get('/login', guestPage, controller.showLogin);
  router.post('/login', guestPage, controller.login);
  router.get('/activate/:token', guestPage, controller.activate);
  router.post('/logout', protectedPage, controller.logout);
  router.get('/forgot-password', guestPage, controller.showForgot);
  router.post('/forgot-password', guestPage, controller.forgot);
  router.get('/reset-password/:token', guestPage, controller.showReset);
  router.post('/reset-password/:token', guestPage, controller.reset);
  router.get(
    '/reset-password-success',
    guestPage,
    controller.resetSuccess,
  );
  router.get('/check-email', guestPage, controller.checkEmail);
  router.get('/profile', protectedPage, controller.profile);
  router.post('/profile/name', protectedPage, controller.updateName);
  router.post(
    '/profile/password',
    protectedPage,
    controller.updatePassword,
  );
  router.post('/profile/email', protectedPage, controller.updateEmail);

  return router;
}

module.exports = createPagesRouter;
