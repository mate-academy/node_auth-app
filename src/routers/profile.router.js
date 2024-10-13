const express = require('express');
const { catchError } = require('../utils/catchError');
const profileController = require('../controllers/profile.controller');

const profileRouter = new express.Router();

profileRouter.patch('/passReset', catchError(profileController.passReset));

profileRouter.get(
  '/passResetConfirmation/:userId',
  catchError(profileController.passResetConfirm),
);

profileRouter.patch('/changeName', catchError(profileController.changeName));

profileRouter.patch('/changeEmail', catchError(profileController.changeEmail));

profileRouter.get(
  '/changeEmailConfirmation/:accessToken',
  catchError(profileController.changeEmailConfirm),
);

module.exports = {
  profileRouter,
};
