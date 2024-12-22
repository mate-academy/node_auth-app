const express = require('express');
const authController = require('../controllers/auth.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const catchError = require('../utils/catchError.js');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/password-reset', catchError(authController.passwordReset));
authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.put(
  '/profile',
  authMiddleware,
  catchError(authController.updateProfile),
);

authRouter.get('*', (req, res) => {
  res.status(404).send({ message: 'Not Found' });
});

module.exports = { authRouter };
