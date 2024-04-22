const express = require('express');

const { UsersController } = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { catchError } = require('../utils/catchError');

const usersRouter = express.Router();

usersRouter.get('/', authMiddleware, catchError(UsersController.getUsers));

usersRouter.patch(
  '/:id/update',
  authMiddleware,
  catchError(UsersController.updateUser),
);

usersRouter.patch(
  '/:id/change-password',
  authMiddleware,
  catchError(UsersController.updatePassword),
);

usersRouter.post(
  '/:id/change-email',
  catchError(authMiddleware),
  catchError(UsersController.updateEmail),
);

usersRouter.post(
  '/change-email/:activationToken',
  catchError(authMiddleware),
  catchError(UsersController.updateEmailConfirm),
);

module.exports = { usersRouter };
