import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireOwnershipMiddleware } from '../middlewares/requireOwnershipMiddleware.js';

const router = new express.Router();

router.get('/', authMiddleware, userController.getAllActiveUsers);
router.patch(
  '/:id',
  authMiddleware,
  requireOwnershipMiddleware,
  userController.updateUser,
);
router.post(
  '/:id/password',
  authMiddleware,
  requireOwnershipMiddleware,
  userController.changePassword,
);

router.patch(
  '/:id/change-email',
  authMiddleware,
  requireOwnershipMiddleware,
  userController.changeEmail,
);

export const userRouter = router;
