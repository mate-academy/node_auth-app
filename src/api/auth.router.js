const { Router } = require('express');
const { authController } = require('../controllers/auth.controller');

const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:token', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

module.exports = {
  authRouter,
};
