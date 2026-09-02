import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  updateNameSchema,
  changePasswordSchema,
  changeEmailSchema,
} from '../validators/users.schemas.js';
import {
  getMeController,
  updateNameController,
  changePasswordController,
  changeEmailController,
} from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', getMeController);
usersRouter.patch('/me', validate(updateNameSchema), updateNameController);

usersRouter.post(
  '/me/password',
  validate(changePasswordSchema),
  changePasswordController,
);

usersRouter.post(
  '/me/email',
  validate(changeEmailSchema),
  changeEmailController,
);
