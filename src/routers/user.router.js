import express from 'express';

import * as userController from '../controllers/user.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middlewares/validation.middleware.js';
import {
  changeNameSchema,
  changePasswordSchema,
  confirmEmailChangeSchema,
  requestEmailChangeSchema,
} from '../schemas/user.schema.js';
import { authenticate } from '../middlewares/aunthentication.middleware.js';

const router = express.Router();

router.patch(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(userController.changePassword),
);

router.patch(
  '/name',
  authenticate,
  validate(changeNameSchema),
  asyncHandler(userController.changeName),
);

router.patch(
  '/email-change',
  authenticate,
  validate(requestEmailChangeSchema),
  asyncHandler(userController.requestEmailChange),
);

router.get(
  '/email-change/confirmation/:token',
  validate(confirmEmailChangeSchema),
  asyncHandler(userController.confirmEmailChange),
);

export default router;
