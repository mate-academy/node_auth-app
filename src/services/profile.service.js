import bcrypt from 'bcrypt';
import nodeCrypto from 'crypto';
import prisma from '../prisma/prismaClient.js';
import { validatePassword } from '../utils/passwordValidator.js';
import {
  sendEmailChangeNotification,
  sendEmailConfirmationEmail,
} from './email.service.js';

const SALT_ROUNDS = 10;

function createError(status, message) {
  const error = new Error(message);

  error.status = status;

  return error;
}

export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      newEmail: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError(404, 'User not found');
  }

  return user;
}

export async function updateName(userId, name) {
  if (!name || !name.trim()) {
    throw createError(400, 'Name is required');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
}

export async function updatePassword(
  userId,
  oldPassword,
  newPassword,
  confirmPassword,
) {
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw createError(400, 'All fields are required');
  }

  if (newPassword !== confirmPassword) {
    throw createError(400, 'Passwords do not match');
  }

  validatePassword(newPassword);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isValid) {
    throw createError(400, 'Old password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
}

export async function requestEmailChange(userId, password, newEmail) {
  if (!password || !newEmail) {
    throw createError(400, 'Password and new email are required');
  }

  const normalizedNewEmail = newEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw createError(400, 'Password is incorrect');
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedNewEmail },
  });

  if (existing) {
    throw createError(400, 'Email already taken');
  }

  const token = nodeCrypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { newEmail: normalizedNewEmail },
  });

  await prisma.token.create({
    data: {
      token,
      type: 'CHANGE_EMAIL',
      expiresAt,
      userId,
    },
  });

  const confirmLink = `http://localhost:3000/profile/confirm-email/${token}`;

  await sendEmailChangeNotification(user.email, normalizedNewEmail);
  await sendEmailConfirmationEmail(normalizedNewEmail, confirmLink);

  return {
    message: 'Confirmation email sent to your new email address',
  };
}

export async function confirmEmailChange(token) {
  const emailToken = await prisma.token.findFirst({
    where: {
      token,
      type: 'CHANGE_EMAIL',
    },
  });

  if (!emailToken) {
    throw createError(404, 'Invalid email confirmation token');
  }

  if (emailToken.expiresAt < new Date()) {
    throw createError(400, 'Email confirmation token expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: emailToken.userId },
  });

  if (!user || !user.newEmail) {
    throw createError(400, 'No pending email change found');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.newEmail,
      newEmail: null,
    },
  });

  await prisma.token.delete({
    where: { id: emailToken.id },
  });

  return { message: 'Email confirmed successfully' };
}
