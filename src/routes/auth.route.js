import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { dataValidate } from '../middlewares/dataValidateMiddleware.js';
import {
  authMiddleware,
  guestMiddleware,
} from '../middlewares/authMiddleware.js';
export const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello from server');
});

router.post(
  '/registration',
  guestMiddleware,
  dataValidate.register,
  catchError(authController.register),
);

router.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

router.post(
  '/login',
  guestMiddleware,
  dataValidate.login,
  catchError(authController.login),
);

router.post(
  '/password/reset',
  guestMiddleware,
  dataValidate.reset,
  catchError(authController.sendResetPassword),
);

router.get(
  '/password/reset/:resetPassToken',
  guestMiddleware,
  catchError(authController.resetPassword),
);

router.post(
  '/password/reset/complete',
  guestMiddleware,
  dataValidate.setPassword,
  catchError(authController.setPassword),
);
router.get('/logout', authMiddleware, catchError(authController.logout));
router.get('/refresh', catchError(authController.refresh));
