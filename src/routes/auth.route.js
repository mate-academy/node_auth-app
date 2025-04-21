const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const authRouter = Router();

authRouter.post('/register', authController.registration);
authRouter.get('/activate/:token', authController.activateUser);
authRouter.post('/login', authController.loginUser);
authRouter.post('/reset', authController.triggertResetPasswordLink);
authRouter.post('/reset/:token', authController.resetPassword);

module.exports = authRouter;
