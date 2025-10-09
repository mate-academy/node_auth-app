import express from 'express';
import {
  updateUserName,
  updateUserPassword,
  requestEmailChange,
  confirmEmailChange,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch('/name', authMiddleware, updateUserName);
router.patch('/password', authMiddleware, updateUserPassword);
router.post('/email', authMiddleware, requestEmailChange);
router.get('/confirm-email-change/:token', confirmEmailChange);

export default router;
