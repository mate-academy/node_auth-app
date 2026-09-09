import express from 'express';

import { catchError } from '../utils/catchError.js';
import { passwordController } from '../controllers/password.controller.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const passwordRouter = express.Router();

passwordRouter.post(
  '/reset',
  guestMiddleware,
  catchError(passwordController.reset),
);

passwordRouter.post(
  '/reset/:resetToken',
  guestMiddleware,
  catchError(passwordController.confirmReset),
);
