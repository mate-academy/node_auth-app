const express = require('express');
const authController = require('../controllers/authController.js');
const { isGuest } = require('./..//middleware/isGuestMiddleware.js');

const authRouter = express.Router();

authRouter.get('/register', isGuest, authController.registrationPage);
authRouter.post('/register', isGuest, authController.register);

authRouter.get('/login', isGuest, authController.loginPage);
authRouter.post('/login', isGuest, authController.login);

authRouter.get(
  '/login/forgot-password',
  isGuest,
  authController.forgotPasswordPage,
);

authRouter.post(
  '/login/forgot-password',
  isGuest,
  authController.forgotPassword,
);

authRouter.get('/activate', isGuest, authController.actvationPage);
authRouter.get('/activate/:activationToken', authController.activateUser);

authRouter.get('/reset-password/succes', isGuest, (req, res) => {
  const message = `Password changed successfully.
      <a style="color: #ea8436; text-decoration: none;" href="/auth/login">
        Login
      </a>`;

  res.render('showMessage', { isAuthorize: false, message });
});

authRouter.get(
  '/reset-password/:token',
  isGuest,
  authController.restPasswordPage,
);
authRouter.post('/reset-password', isGuest, authController.resetPassword);

module.exports = {
  authRouter,
};
