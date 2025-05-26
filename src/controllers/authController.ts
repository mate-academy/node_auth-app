import { Request, Response, NextFunction } from 'express';
import { users, User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';

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
      isActive: true,
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

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email.toLowerCase());

  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account is not activated' });
  }

  const token = generateToken(user.id);

  return res.status(200).json({ message: 'Login successful', token  });
}
