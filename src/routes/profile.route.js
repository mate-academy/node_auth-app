import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.use(authMiddleware);

router.get('/', catchError(profileController.getProfile));
router.patch('/name', catchError(profileController.updateName));
router.patch('/password', catchError(profileController.changePassword));
router.patch('/email', catchError(profileController.changeEmail));
