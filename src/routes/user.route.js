import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const router = express.Router();

router.get('/', authMiddleware, catchError(userController.getAllActivated));
