import { Router } from 'express';
import { User } from '../models/user.js';

export const usersRouter = Router();

usersRouter.get('/users', async (req, res) => {
  const users = await User.findAll();

  res.status(200).json(users);
});
