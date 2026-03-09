import bcrypt from 'bcrypt';
import prisma from '../prisma/prismaClient.js';

const SALT_ROUNDS = 10;

export async function updateName(userId, name) {
  if (!name || !name.trim()) {
    throw new Error('Name is required');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  return user;
}

export async function updatePassword(userId, oldPassword, newPassword) {
  if (!oldPassword || !newPassword) {
    throw new Error('Passwords are required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isValid) {
    throw new Error('Old password is incorrect');
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
}

export async function updateEmail(userId, password, newEmail) {
  if (!password || !newEmail) {
    throw new Error('Password and new email are required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error('Password is incorrect');
  }

  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existing) {
    throw new Error('Email already taken');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
  });

  return { message: 'Email updated successfully' };
}
