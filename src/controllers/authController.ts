import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { TokenType } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import { sendActivationEmail } from '../services/mailService.js';

type AuthRequestBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const ACTIVATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

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

function validateName(value: string): string | null {
  if (!value.trim()) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'Name must be at least 3 characters';
  }

  return null;
}

const registration = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, confirmPassword } = (req.body ??
    {}) as AuthRequestBody;

  if (typeof email !== 'string') {
    res.status(400).json({ message: 'Email must be a string' });

    return;
  }

  if (typeof name !== 'string') {
    res.status(400).json({ message: 'Name must be a string' });

    return;
  }

  if (typeof password !== 'string') {
    res.status(400).json({ message: 'Password must be a string' });

    return;
  }

  if (typeof confirmPassword !== 'string') {
    res.status(400).json({ message: 'Confirm password must be a string' });

    return;
  }

  const trimmedEmail = email.trim();
  const emailError = validateEmail(trimmedEmail);

  if (emailError) {
    res.status(400).json({ message: emailError });

    return;
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    res.status(400).json({ message: passwordError });

    return;
  }

  const confirmPasswordError = validatePassword(confirmPassword);

  if (confirmPasswordError) {
    res.status(400).json({ message: confirmPasswordError });

    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const trimmedName = name.trim();
  const nameError = validateName(trimmedName);

  if (nameError) {
    res.status(400).json({ message: nameError });

    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: trimmedEmail,
    },
  });

  if (existingUser) {
    res.status(409).json({ message: 'User with this email already exists' });

    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
    },
  });

  const activationToken = randomUUID();
  const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS);

  await prisma.token.create({
    data: {
      userId: user.id,
      type: TokenType.EMAIL_ACTIVATION,
      token: activationToken,
      expiresAt,
    },
  });
  await sendActivationEmail(user.email, activationToken);

  res.status(201).json({
    message: 'User registered successfully.',
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      isActivated: user.isActivated,
      activationToken,
    },
  });
};

const activate = async (req: Request, res: Response): Promise<void> => {
  const rawActivationToken = req.params.token;

  if (typeof rawActivationToken !== 'string') {
    res.status(400).json({ message: 'Activation token is required' });

    return;
  }

  const activationToken = rawActivationToken.trim();

  if (!activationToken) {
    res.status(400).json({ message: 'Activation token is required' });

    return;
  }

  const existingToken = await prisma.token.findFirst({
    where: {
      token: activationToken,
      type: TokenType.EMAIL_ACTIVATION,
    },
  });

  if (!existingToken) {
    res.status(400).json({ message: 'Activation token is invalid or expired' });

    return;
  }

  if (existingToken.expiresAt <= new Date()) {
    await prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    res.status(400).json({ message: 'Activation token is invalid or expired' });

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

  const user = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      isActivated: true,
    },
  });

  await prisma.token.delete({
    where: {
      id: existingToken.id,
    },
  });

  res.status(200).json({
    message: 'Account activated successfully.',
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      isActivated: user.isActivated,
    },
  });
};

export const authController = {
  activate,
  registration,
};
