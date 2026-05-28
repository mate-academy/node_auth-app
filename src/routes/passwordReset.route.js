/* eslint-disable max-len */
import express from 'express';
import { catchError } from '../utils/cathcError.js';
import { passwordResetController } from '../controllers/passwordReset.controller.js';

export const passwordResetrouter = new express.Router();

passwordResetrouter.post(
  '/reset-password',
  catchError(passwordResetController.reset),
);

passwordResetrouter.get(
  '/reset-password/verify/:resetToken',
  catchError(passwordResetController.activate),
);

passwordResetrouter.post(
  '/reset-password/confirm',
  catchError(passwordResetController.createNewPassword),
);
