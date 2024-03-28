'use strict';

const express = require('express');
const { ApiRoutes } = require('../libs/enums/enums.js');
const { catchError } = require('../libs/middlewares/middlewares.js');
const {
  signupValidation,
  loginValidation,
  requestResetValidation,
  resetValidation,
} = require('../libs/validation/auth/validation.js');
const { AuthController } = require('../controllers/auth.controller.js');
const {
  authService, resetService, signupService,
} = require('../services/auth/auth.js');

const authRouter = new express.Router();

const authController = new AuthController(
  authService,
  signupService,
  resetService,
);

authRouter.post(
  ApiRoutes.REGISTRATION,
  catchError(signupValidation),
  catchError(authController.signup.bind(authController)),
);

authRouter.get(
  ApiRoutes.ACTIVATION,
  catchError(authController.activate.bind(authController))
);

authRouter.post(
  ApiRoutes.LOGIN,
  catchError(loginValidation),
  catchError(authController.login.bind(authController))
);

authRouter.post(
  ApiRoutes.LOGOUT,
  catchError(authController.logout.bind(authController))
);

authRouter.get(
  ApiRoutes.REFRESH,
  catchError(authController.refresh.bind(authController))
);

authRouter.post(
  ApiRoutes.REQUEST_RESET,
  catchError(requestResetValidation),
  catchError(authController.requestReset.bind(authController)),
);

authRouter.get(
  ApiRoutes.VERIFY_TOKEN,
  catchError(authController.verifyResetToken.bind(authController)),
);

authRouter.post(
  ApiRoutes.RESET,
  catchError(resetValidation),
  catchError(authController.reset.bind(authController)),
);

module.exports = { authRouter };
