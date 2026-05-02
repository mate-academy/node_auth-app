import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getProfile,
  updateName,
  changePassword,
  changeEmail,
} from '../controllers/userController.js';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateName);
router.patch('/password', authMiddleware, changePassword);
router.patch('/email', authMiddleware, changeEmail);

export const userRouter = router;
