import {
  activate,
  forgotPassword,
  login,
  logOut,
  register,
  resetPasswordConfirmation,
} from '../controllers/AuthController';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { changeEmail, resetName } from '../controllers/ProfileController';

const router = Router();

router.post('/register', register);
router.get('/activate/:token', activate);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordConfirmation);


router.post('/logout', isAuthenticated, logOut);
router.put('/profile/name', isAuthenticated, resetName);
router.put('/profile/email', isAuthenticated, changeEmail);

export default router;
