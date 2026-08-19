'use strict';

const { Router } = require('express');

function createProfileRouter(controller, authMiddleware) {
  const router = Router();

  router.use(authMiddleware.requireAuth);
  router.get('/', controller.getProfile);
  router.patch('/name', controller.updateName);
  router.patch('/password', controller.updatePassword);
  router.patch('/email', controller.updateEmail);

  return router;
}

module.exports = createProfileRouter;
