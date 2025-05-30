import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/generateToken';
import prisma from '../prismaClient';
import {
  generateResetToken,
  loginUser,
  registerUser,
  resetPassword,
  updateUserProfile,
} from '../services/authService';
import { AppError } from '../utils/AppError';

export const register = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { name, email, password, passwordConfirmation } = req.body;

    if (!email || !password || !name || !passwordConfirmation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await registerUser(name, email, password, passwordConfirmation);

    return res.status(201).json({
      message:
        'User registered successfully. Please activate your account via email.',
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const userId = await loginUser(email, password);

    const token = generateToken(userId);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const allUsers = await prisma.user.findMany();
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const activateUser = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { activationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid activation token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        activationToken: null,
      },
    });

    return res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await generateResetToken(email);

    return res.status(200).json({
      message:
        'If this email is registered, you will receive instructions to reset your password.',
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Token and new password are required' });
    }

    await resetPassword(token, newPassword);

    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not defined');
    }
    return res
      .status(200)
      .json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, currentPassword, newPassword, newEmail } = req.body;

    const result = await updateUserProfile(userId, {
      name,
      currentPassword,
      newPassword,
      newEmail,
    });
    if (!result.updated) {
      return res.status(400).json({ error: 'No changes detected' });
    }

    if (result.emailChanged) {
      return res
        .status(200)
        .json({ message: 'Email change initiated. Please check your emails.' });
    }

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
