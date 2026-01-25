import { Router } from 'express';
import {
  forgotPassword,
  resetPassword,
} from '../controllers/password.controller.js';

const router = Router();

router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);

export default router;
