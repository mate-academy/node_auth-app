import express from 'express';
import { usersController } from '../controllers/users-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { catchError } from '../utils/catch-error.js';

export const usersRouter = new express.Router();

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
