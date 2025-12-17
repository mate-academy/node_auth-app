import express from 'express';
import { updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.put('/profile', authenticate, updateProfile);

export default router;