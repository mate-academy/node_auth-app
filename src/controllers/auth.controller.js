import prisma from '../prisma/prismaClient.js';
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  confirmPasswordReset,
} from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function activate(req, res, next) {
  try {
    const { token } = req.params;

    const activationToken = await prisma.token.findUnique({
      where: { token },
    });

    if (!activationToken) {
      return res.status(404).json({ message: 'Invalid activation token' });
    }

    await prisma.user.update({
      where: { id: activationToken.userId },
      data: { isActive: true },
    });

    await prisma.token.delete({
      where: { id: activationToken.id },
    });

    res.json({ message: 'Account activated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function passwordResetRequest(req, res, next) {
  try {
    const { email } = req.body;

    const result = await requestPasswordReset(email);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function passwordResetConfirm(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    const result = await confirmPasswordReset(token, password);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
