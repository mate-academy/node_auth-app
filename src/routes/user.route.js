const { Router } = require('express');
const { catchError } = require('../middlewars/catchErrorMiddleware.js');
const userController = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewars/authMiddleware.js');

const userRoute = Router();

userRoute.patch(
  '/update-name',
  authMiddleware,
  catchError(userController.updateName),
);

userRoute.patch(
  '/update-password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRoute.patch(
  '/update-email-request',
  authMiddleware,
  catchError(userController.updateEmailRequest),
);

userRoute.patch(
  '/update-email/:token',
  authMiddleware,
  catchError(userController.updateEmail),
);

module.exports = {
  userRoute,
};
