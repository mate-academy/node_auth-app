const { Router } = require('express');
const { catchError } = require('../middlewars/catchErrorMiddleware.js');
const userController = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewars/authMiddleware.js');

const userRoute = Router();
const ROOT = '/user';

userRoute.patch(
  ROOT + '/update-name',
  authMiddleware,
  catchError(userController.updateName),
);

userRoute.patch(
  ROOT + '/update-password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRoute.patch(
  ROOT + '/update-email-request',
  authMiddleware,
  catchError(userController.updateEmailRequest),
);

userRoute.patch(
  ROOT + '/update-email/:token',
  authMiddleware,
  catchError(userController.updateEmail),
);

module.exports = {
  userRoute,
};
