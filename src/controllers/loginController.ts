import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { TokenType } from '../generated/prisma/enums.js';

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = (req.body ?? {}) as LoginRequestBody;

  if (typeof email !== 'string') {
    res.status(400).json({ message: 'Email must be a string' });

    return;
  }

  if (typeof password !== 'string') {
    res.status(400).json({ message: 'Password must be a string' });

    return;
  }

  const emailError = validateEmail(email);

  if (emailError) {
    res.status(400).json({ message: emailError });

    return;
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    res.status(400).json({ message: passwordError });

    return;
  }

  const trimmedEmail = email.trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: trimmedEmail,
    },
  });

  if (!existingUser) {
    res.status(401).json({ message: 'Invalid email or password' });

    return;
  }

  const isPassEqual = await bcrypt.compare(password, existingUser.passwordHash);

  if (!isPassEqual) {
    res.status(401).json({ message: 'Invalid email or password' });

    return;
  }

  if (!existingUser.isActivated) {
    res.status(403).json({ message: 'Please activate your email first' });

    return;
  }

  const refreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.token.create({
    data: {
      userId: existingUser.id,
      type: TokenType.REFRESH_TOKEN,
      token: refreshToken,
      expiresAt,
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  });

  res.status(200).json({
    message: 'Login successful.',
    data: {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      isActivated: existingUser.isActivated,
    },
  });
};

export const loginController = {
  login,
};
