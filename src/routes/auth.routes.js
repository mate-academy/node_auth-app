import { Router } from 'express';

import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authValidators } from '../validators/auth.validators.js';

const router = Router();

router.post(
  '/register',
  guestMiddleware,
  validate(authValidators.register),
  authController.register,
);

router.post(
  '/login',
  guestMiddleware,
  validate(authValidators.login),
  authController.login,
);

router.get('/activate', guestMiddleware, authController.activate);

router.post(
  '/password/reset-request',
  guestMiddleware,
  validate(authValidators.resetRequest),
  authController.resetRequest,
);

router.post(
  '/password/reset-confirm',
  guestMiddleware,
  validate(authValidators.resetConfirm),
  authController.resetConfirm,
);

router.post('/logout', authMiddleware, authController.logout);

export default router;
