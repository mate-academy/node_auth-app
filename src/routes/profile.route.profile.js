import express from 'express';
import { profileController } from '../controllers/profile.contoller.js';
import { catchError } from '../utils/cathcError.js';
import { authenticate } from '../middlewares/authMiddleware.js';

export const profilerouter = new express.Router();

profilerouter.patch(
  '/name',
  authenticate,
  catchError(profileController.updateName),
);

profilerouter.patch(
  '/password',
  authenticate,
  catchError(profileController.updatePassword),
);

profilerouter.patch(
  '/email',
  authenticate,
  catchError(profileController.updateEmail),
);

profilerouter.get(
  '/email/:emailChangeToken',
  authenticate,
  catchError(profileController.confirmEmailChange),
);
