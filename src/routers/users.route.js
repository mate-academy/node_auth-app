import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { userController } from '../controllers/users.controller.js';

export const router = express.Router();

router.get('/', authMiddleware, userController.getAll);
router.get('/:email', authMiddleware, userController.getUserByEmail);
router.patch('/:email', authMiddleware, userController.updateUser);
