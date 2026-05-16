import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const profileRoutes = Router();

profileRoutes.get(
  '/',
  authMiddleware,
  asyncHandler(profileController.getProfile),
);

profileRoutes.patch(
  '/name',
  authMiddleware,
  asyncHandler(profileController.updateName),
);

profileRoutes.patch(
  '/password',
  authMiddleware,
  asyncHandler(profileController.changePassword),
);

profileRoutes.patch(
  '/email',
  authMiddleware,
  asyncHandler(profileController.changeEmail),
);

profileRoutes.get(
  '/email/confirm/:token',
  asyncHandler(profileController.confirmEmailChange),
);
