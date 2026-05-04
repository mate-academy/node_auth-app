import { Router } from 'express';
import { passwordResetController } from '../controllers/passwordResetController.js';

export const passwordResetRouter = Router();

passwordResetRouter.post(
  '/password-reset/request',
  passwordResetController.request,
);

passwordResetRouter.post(
  '/password-reset/confirm/:token',
  passwordResetController.confirm,
);
