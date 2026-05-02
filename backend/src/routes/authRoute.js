import { Router } from 'express';
import {
  register,
  login,
  activate,
  refresh,
  logout,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/activate/:token', activate);
router.get('/refresh', refresh);
router.post('/logout', logout);

export const authRouter = router;
