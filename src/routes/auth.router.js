const { Router } = require('express');
const { authController } = require('../controllers/auth.controller');
const cookieParser = require('cookie-parser');

const authRouter = Router();

authRouter.use(cookieParser());

authRouter.post('/registration', authController.register);

authRouter.get('/activation/:email/:token', authController.activate);

authRouter.post('/login', authController.login);
authRouter.get('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

// eslint-disable-next-line no-unused-expressions
module.e;
