import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { dataValidate } from '../middlewares/dataValidateMiddleware.js';

export const router = express.Router();

router.get('/', authMiddleware, catchError(profileController.getProfile));
router.patch('/name', authMiddleware, catchError(profileController.nameUpdate));

router.patch(
  '/email',
  authMiddleware,
  dataValidate.updateEmail,
  catchError(profileController.emailUpdate),
);

router.patch(
  '/password',
  authMiddleware,
  dataValidate.updatePassword,
  catchError(profileController.passwordUpdate),
);
