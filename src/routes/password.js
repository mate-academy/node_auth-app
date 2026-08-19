'use strict';

const { Router } = require('express');

function createPasswordRouter(controller, authMiddleware) {
  const router = Router();

  router.post('/forgot', authMiddleware.guestOnly, controller.forgotPassword);
  router.post(
    '/reset/:token',
    authMiddleware.guestOnly,
    controller.resetPassword,
  );

  return router;
}

module.exports = createPasswordRouter;
