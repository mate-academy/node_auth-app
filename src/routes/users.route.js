const { Router } = require('express');
const { usersController } = require('../controllers');
const { authMiddleware } = require('../middlewares');
const { catchError } = require('../utils');

const usersRouter = Router();

usersRouter.get('/me', authMiddleware, catchError(usersController.getMe));
usersRouter.get('/', authMiddleware, catchError(usersController.getAll));

usersRouter.patch(
  '/me/name',
  authMiddleware,
  catchError(usersController.updateName),
);

usersRouter.patch(
  '/me/password',
  authMiddleware,
  catchError(usersController.updatePassword),
);

usersRouter.patch(
  '/me/email',
  authMiddleware,
  catchError(usersController.updateEmail),
);

usersRouter.get(
  '/me/email/confirm/:token',
  catchError(usersController.confirmEmail),
);

usersRouter.get(
  '/me/social-accounts',
  authMiddleware,
  catchError(usersController.getSocialAccounts),
);

usersRouter.delete(
  '/me/social-accounts/:provider',
  authMiddleware,
  catchError(usersController.removeSocialAccount),
);

module.exports = usersRouter;
