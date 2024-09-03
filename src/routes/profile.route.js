const express = require('express');

const { catchError } = require('../utils/catchError');

const profileController = require('../controllers/profile.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const profileRouter = new express.Router();

profileRouter.post(
  '/changeName',
  authMiddleware,
  catchError(profileController.changeName),
);

profileRouter.post(
  '/changePassword',
  authMiddleware,
  catchError(profileController.changePassword),
);

profileRouter.post(
  '/changeEmail',
  authMiddleware,
  catchError(profileController.changeEmail),
);

profileRouter.get(
  '/activateEmail/:token',
  authMiddleware,
  catchError(profileController.activateEmail),
);

module.exports = {
  profileRouter,
};
