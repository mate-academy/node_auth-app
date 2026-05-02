import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getProfile,
  updateName,
  changePassword,
} from '../controllers/userController.js';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateName);
router.patch('/password', authMiddleware, changePassword);

export const userRouter = router;
