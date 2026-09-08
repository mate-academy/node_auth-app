import express from 'express';

import { catchError } from '../utils/catchError.js';
import { passwordController } from '../controllers/password.controller.js';

export const passwordRouter = express.Router();

passwordRouter.post('/reset', catchError(passwordController.reset));

passwordRouter.post(
  '/reset/:resetToken',
  catchError(passwordController.confirmReset),
);
