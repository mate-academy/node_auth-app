const { Router } = require('express');
const cookieParser = require('cookie-parser');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/cathcError.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');

const authRouter = Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

module.exports = {
  authRouter,
};
