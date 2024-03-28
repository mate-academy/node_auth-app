'use strict';

const express = require('express');

const {
  authMiddleware, catchError,
} = require('../libs/middlewares/middlewares.js');
const {
  usernameEditValidation,
  passwordEditValidation,
  emailEditValidation,
} = require('../libs/validation/profile/validation.js');

const { ProfileController } = require('../controllers/profile.controller.js');
const { profileService } = require('../services/profile/profile.js');
const { ApiRoutes } = require('../libs/enums/api-routes.js');

const profileRouter = new express.Router();

const profileController = new ProfileController(profileService);

profileRouter.patch(
  ApiRoutes.EDIT_USERNAME,
  catchError(authMiddleware),
  catchError(usernameEditValidation),
  catchError(profileController.editUsername.bind(profileController))
);

profileRouter.patch(
  ApiRoutes.EDIT_PASSWORD,
  catchError(authMiddleware),
  catchError(passwordEditValidation),
  catchError(profileController.editPassword.bind(profileController))
);

profileRouter.patch(
  ApiRoutes.EDIT_EMAIL_REQUEST,
  catchError(authMiddleware),
  catchError(emailEditValidation),
  catchError(profileController.editEmailRequest.bind(profileController))
);

profileRouter.patch(
  ApiRoutes.EDIT_EMAIL,
  catchError(profileController.editEmail.bind(profileController))
);

module.exports = {
  profileRouter,
};
