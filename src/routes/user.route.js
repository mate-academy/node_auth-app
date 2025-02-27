import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { validationSchemas } from '../utils/validation.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.patch(
  '/change-name',
  authMiddleware,
  validateMiddleware(validationSchemas.changeNameSchema),
  catchError(userController.changeName),
);

userRouter.patch(
  '/change-password',
  authMiddleware,
  validateMiddleware(validationSchemas.passwordSchema),
  catchError(userController.changePassword),
);

userRouter.patch(
  '/change-email',
  authMiddleware,
  validateMiddleware(validationSchemas.emailSchema),
  catchError(userController.changeEmail),
);
