import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRoutes = new Router();

userRoutes.post('/register', userController.register);
userRoutes.get('/activate/:token', userController.activate);
userRoutes.post('/login', userController.login);

userRoutes.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out' });
});
