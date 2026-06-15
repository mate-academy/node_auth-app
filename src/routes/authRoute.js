const express = require('express');
const authController = require('../controllers/authController.js');

const authRouter = express.Router();

authRouter.get('/register', authController.registrationPage);
authRouter.post('/register', authController.register);

authRouter.get('/login', authController.loginPage);
authRouter.post('/login', authController.login);

authRouter.get('/login/forgot-password', authController.forgotPasswordPage);
authRouter.post('/login/forgot-password', authController.forgotPassword);

authRouter.get('/activate', authController.actvationPage);

authRouter.get('/activate/:activationToken', authController.activateUser);

authRouter.get('/reset-password/succes', (req, res) => {
  const message = `Password changed successfully.
      <a style="color: #ea8436; text-decoration: none;" href="/auth/login">
        Login
      </a>`;

  res.render('showMessage', { isAuthorize: false, message });
});

authRouter.get('/reset-password/:token', authController.resetPasswordPage);
authRouter.post('/reset-password', authController.resetPassword);

module.exports = {
  authRouter,
};
