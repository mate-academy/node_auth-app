const { Router } = require('express');
const { authController } = require('../controllers/auth.controller');
const { cookieParser } = require('cookie-parser');

const authRouter = Router();

authRouter.post('/registration', authController.register);

authRouter.get('/activation/:email/:token', authController.activate);

authRouter.post('/login', authController.login);

authRouter.get('/refresh', cookieParser(), authController.refresh);

authRouter.post('/logout', authController.logout);

module.exports = {
  authRouter,
};
