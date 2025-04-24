const express = require('express');
const {
  existUserMiddleware,
} = require('../middlewares/ExistUserMiddleware.js');
const { authController } = require('../controllers/auth.controller.js');
const { isGuest } = require('../middlewares/isGuestMiddleware.js');
const { isAuth } = require('../middlewares/isAuthMiddleware.js');

const authRoute = new express.Router();

authRoute.post(
  '/registration',
  isGuest,
  existUserMiddleware,
  authController.register,
);
authRoute.get('/activation/:activationToken', isGuest, authController.activate);
authRoute.post('/login', isGuest, authController.login);
authRoute.post('/logout', isAuth, authController.logout);

module.exports = { authRoute };
