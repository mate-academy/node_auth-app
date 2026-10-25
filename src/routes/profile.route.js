const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');
const { profileController } = require('../controllers/profile.controller.js');

const profileRouter = new express.Router();

profileRouter.get(
  '/profile',
  authMiddleware,
  catchError(profileController.getInfoForUser),
);

profileRouter.patch(
  '/profile',
  authMiddleware,
  catchError(profileController.changeName),
);

profileRouter.post(
  '/profile/password',
  authMiddleware,
  catchError(profileController.changePassword),
);

profileRouter.post(
  '/profile/email',
  authMiddleware,
  catchError(profileController.changeEmail),
);

module.exports = { profileRouter };
