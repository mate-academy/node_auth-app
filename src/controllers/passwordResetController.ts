import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { TokenType } from '../generated/prisma/enums.js';
import { sendPasswordResetEmail } from '../services/mailService.js';

type PasswordReset = {
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const PASSWORD_RESET_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function validateEmail(value: string): string | null {
  const trimmedEmail = value.trim();

  if (!trimmedEmail) {
    return 'Email is required';
  }

  if (!emailPattern.test(trimmedEmail)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(value: string): string | null {
  if (!value.trim()) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
}

const request = async (req: Request, res: Response): Promise<void> => {
  const { email } = (req.body ?? {}) as PasswordReset;

  if (typeof email !== 'string') {
    res.status(400).json({ message: 'Email must be a string' });

    return;
  }

  const emailError = validateEmail(email);

  if (emailError) {
    res.status(400).json({ message: emailError });

    return;
  }

  const trimmedEmail = email.trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: trimmedEmail,
    },
  });

  if (existingUser) {
    const passwordResetToken = randomUUID();

    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    await prisma.token.create({
      data: {
        userId: existingUser.id,
        type: TokenType.PASSWORD_RESET,
        token: passwordResetToken,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(existingUser.email, passwordResetToken);
  }

  res.status(200).json({
    message:
      'If an account with this email exists, a reset link has been sent.',
    data: {},
  });
};

const confirm = async (req: Request, res: Response): Promise<void> => {
  const rawPasswordResetToken = req.params.token;
  const { password: newPassword, confirmPassword: confirmNewPassword } =
    (req.body ?? {}) as PasswordReset;

  if (typeof rawPasswordResetToken !== 'string') {
    res.status(400).json({ message: 'Password reset token is required' });

    return;
  }

  const passwordResetToken = rawPasswordResetToken.trim();

  if (!passwordResetToken) {
    res.status(400).json({ message: 'Password reset token is required' });

    return;
  }

  const existingToken = await prisma.token.findFirst({
    where: {
      token: passwordResetToken,
      type: TokenType.PASSWORD_RESET,
    },
  });

  if (!existingToken) {
    res
      .status(400)
      .json({ message: 'Password reset token is invalid or expired' });

    return;
  }

  if (existingToken.expiresAt <= new Date()) {
    await prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    res
      .status(400)
      .json({ message: 'Password reset token is invalid or expired' });

    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: existingToken.userId,
    },
  });

  if (!existingUser) {
    await prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    res.status(404).json({ message: 'User not found' });

    return;
  }

  if (typeof newPassword !== 'string') {
    res.status(400).json({ message: 'Password must be a string' });

    return;
  }

  if (typeof confirmNewPassword !== 'string') {
    res.status(400).json({ message: 'Confirm password must be a string' });

    return;
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    res.status(400).json({ message: passwordError });

    return;
  }

  const confirmPasswordError = validatePassword(confirmNewPassword);

  if (confirmPasswordError) {
    res.status(400).json({ message: confirmPasswordError });

    return;
  }

  if (newPassword !== confirmNewPassword) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { passwordHash },
  });

  await prisma.token.delete({ where: { id: existingToken.id } });

  res.status(200).json({
    message: 'Password updated successfully.',
  });
};

export const passwordResetController = {
  request,
  confirm,
};
