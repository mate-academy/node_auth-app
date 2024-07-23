const express = require('express');
const { usersController } = require('../controllers/users-controller.js');
const { authMiddleware } = require('../middlewares/auth-middleware.js');
const { catchError } = require('../utils/catch-error.js');

const usersRouter = new express.Router();

usersRouter.get(
  '/users',
  catchError(authMiddleware),
  catchError(usersController.getAll),
);

usersRouter.get(
  '/profile',
  catchError(authMiddleware),
  catchError(usersController.getProfile),
);

usersRouter.patch(
  '/name',
  catchError(authMiddleware),
  catchError(usersController.updateName),
);

usersRouter.patch(
  '/password',
  catchError(authMiddleware),
  catchError(usersController.updatePassword),
);

usersRouter.patch(
  '/email',
  catchError(authMiddleware),
  catchError(usersController.updateEmail),
);

module.exports = {
  usersRouter,
};
