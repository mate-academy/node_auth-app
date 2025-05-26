import { Request, Response, NextFunction } from 'express';
import { users, User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    const emailLower = email.toLowerCase();

    const existingUser = users.find((user) => user.email === emailLower);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    const isValidPassword = /^[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    if (!isValidPassword) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters and contain only allowed characters',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuidv4(),
      name,
      email: emailLower,
      passwordHash,
      isActive: false,
    };

    users.push(newUser);

    return res.status(201).json({
      message:
        'User registered successfully. Please activate your account via email.',
    });
  } catch (error) {
    next(error);
  }
};
