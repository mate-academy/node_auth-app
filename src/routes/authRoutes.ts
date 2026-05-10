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

export const authRouter = router.post('/register', register);
export const tokenRouter = router.get('/activate/:token', activate);
export const logInRouter = router.get('/login', login);
export const forgotPasswordRouter = router.post(
  '/forgot-password',
  forgotPassword,
);
export const resetPasswordRouter = router.post(
  '/reset-password/:token',
  resetPasswordConfirmation,
);

export const logOutRouter = router.post('/logout', isAuthenticated, logOut);
export const resetNameRouter = router.put(
  '/profile/name',
  isAuthenticated,
  resetName,
);
export const changeEmailRouter = router.put(
  '/profile/email',
  isAuthenticated,
  changeEmail,
);
