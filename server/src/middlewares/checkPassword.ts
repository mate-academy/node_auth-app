import type { Request, Response, NextFunction } from 'express';
import { userRepository } from '../feature/User/user.repository.js';
import bcrypt from 'bcrypt';
import type { User } from '../models/User.model.js';

export const checkPassword = async (res: Response, user: User | null, password: string) => {
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid password' });
  }
};
