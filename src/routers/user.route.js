import { Router } from 'express';

import * as userValidator from '../validators/user.validator.js';
import * as userController from '../controllers/user.controller.js';
import catchError from '../utils/catchError.js';

const router = Router();

router.patch(
  '/name',
  userValidator.changeName,
  catchError(userController.changeName),
);

router.patch(
  '/email',
  userValidator.changeEmail,
  catchError(userController.changeEmail),
);

router.patch(
  '/password',
  userValidator.changePassword,
  catchError(userController.changePassword),
);

router.get(
  '/activate/:activationNewEmailToken',
  userValidator.activateNewEmail,
  catchError(userController.activateNewEmail),
);

export default router;
