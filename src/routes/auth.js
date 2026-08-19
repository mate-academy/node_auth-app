'use strict';

const { Router } = require('express');

function createAuthRouter(controller, authMiddleware) {
  const router = Router();

  router.get('/password-rules', controller.passwordRules);
  router.post('/register', authMiddleware.guestOnly, controller.register);
  router.get('/activate/:token', authMiddleware.guestOnly, controller.activate);
  router.post('/login', authMiddleware.guestOnly, controller.login);
  router.post('/logout', authMiddleware.requireAuth, controller.logout);

  return router;
}

module.exports = createAuthRouter;
