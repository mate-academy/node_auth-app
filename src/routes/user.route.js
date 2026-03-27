import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { catchError } from '../middlewares/catch-error.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authValidation } from '../validations/auth.validation.js';

export const userRouter = express.Router();

userRouter.get('/', catchError(userController.getProfile));

userRouter.patch(
  '/',
  validate(authValidation.updateName),
  catchError(userController.updateName),
);

userRouter.patch(
  '/password',
  validate(authValidation.updatePassword),
  catchError(userController.updatePassword),
);

userRouter.post(
  '/change-email',
  validate(authValidation.requestEmailChange),
  catchError(userController.requestEmailChange),
);

userRouter.delete(
  '/social/:provider',
  catchError(userController.unlinkSocialAccount),
);
