import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodeCrypto from 'crypto';
import prisma from '../prisma/prismaClient.js';
import {
  sendActivationEmail,
  sendPasswordResetEmail,
} from './email.service.js';
import { validatePassword } from '../utils/passwordValidator.js';

const SALT_ROUNDS = 10;
const ACTIVATION_TOKEN_EXPIRES_IN_HOURS = 24;

function createError(status, message) {
  const error = new Error(message);

  error.status = status;

  return error;
}

function validateRegisterData({ name, email, password }) {
  if (!name || !email || !password) {
    throw createError(400, 'Name, email and password are required');
  }

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    throw createError(400, 'Invalid data format');
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    throw createError(400, 'Name is required');
  }

  if (!trimmedEmail) {
    throw createError(400, 'Email is required');
  }

  if (!trimmedEmail.includes('@')) {
    throw createError(400, 'Email is not valid');
  }

  validatePassword(password);

  return {
    name: trimmedName,
    email: trimmedEmail,
    password,
  };
}

export async function registerUser(data) {
  const { name, email, password } = validateRegisterData(data);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError(409, 'Email is already taken');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      isActive: false,
    },
  });

  const token = nodeCrypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + ACTIVATION_TOKEN_EXPIRES_IN_HOURS * 60 * 60 * 1000,
  );

  const activationToken = await prisma.token.create({
    data: {
      token,
      type: 'ACTIVATION',
      expiresAt,
      userId: user.id,
    },
  });

  const activationLink = `http://localhost:3000/auth/activate/${activationToken.token}`;

  await sendActivationEmail(email, activationLink);

  return {
    message: 'Registration successful. Check your email to activate account',
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw createError(403, 'Please activate your account first');
  }

  const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' });

  return {
    token,
  };
}

export async function requestPasswordReset(email) {
  if (!email) {
    throw createError(400, 'Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { message: 'Email sent' };
  }

  const token = nodeCrypto.randomUUID();

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.token.create({
    data: {
      token,
      type: 'RESET_PASSWORD',
      expiresAt,
      userId: user.id,
    },
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await sendPasswordResetEmail(user.email, resetLink);

  return { message: 'Email sent' };
}

export async function confirmPasswordReset(token, password) {
  if (!token || !password) {
    throw createError(400, 'Token and password are required');
  }

  validatePassword(password);

  const resetToken = await prisma.token.findFirst({
    where: {
      token,
      type: 'RESET_PASSWORD',
    },
  });

  if (!resetToken) {
    throw createError(404, 'Invalid reset token');
  }

  if (resetToken.expiresAt < new Date()) {
    throw createError(400, 'Reset token expired');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  await prisma.token.delete({
    where: { id: resetToken.id },
  });

  return {
    message: 'Password reset successful',
  };
}
