'use strict';

const { Router } = require('express');

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidator,
  loginValidator,
} = require('../validators/authValidators');

const authRouter = Router();

authRouter.post(
  '/register',
  registerValidator,
  validate,
  authController.register,
);
authRouter.get('/activate/:token', authController.activate);
authRouter.post('/login', loginValidator, validate, authController.login);
authRouter.post('/logout', authMiddleware, authController.logout);

module.exports = authRouter;
