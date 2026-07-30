import express from 'express';
import { userController } from '../controller/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { catchError } from '../utills/catchError.js';

const router = express.Router();

router.get('/profile/:id', authMiddleware, catchError(userController.getMe));

router.patch(
  '/update/:id',
  authMiddleware,
  catchError(userController.updateName),
);

export { router };
