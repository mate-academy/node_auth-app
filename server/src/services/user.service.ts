import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { ApiError } from '../exceptions/ApiError';
import { User } from '../generated/prisma/client';
import { emailService } from './email.service';

const RESET_TOKEN_TTL = 60 * 60 * 1000; // 1 hour

function normalize({ id, name, email }: User) {
  return { id, name, email };
}

async function getByIdOrFail(id: number) {
  const user = await findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

async function register(name: string, email: string, password: string) {
  const exsting = await findByEmail(email);

  if (exsting) {
    throw ApiError.badRequest('User already exists!', {
      email: 'Email is already taken',
    });
  }

  const hash = await bcrypt.hash(password, 10);
  const activationToken = randomUUID();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      activationToken,
    },
  });

  await emailService.sendActivationEmail(email, activationToken);

  return normalize(user);
}

async function activate(activationToken: string) {
  const user = await prisma.user.findUnique({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('Activation link is invalid or already used');
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { activationToken: null },
  });
}

function findById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

async function requestPasswordReset(email: string) {
  const user = await findByEmail(email);

  if (!user) {
    return;
  }

  const resetToken = randomUUID();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL),
    },
  });

  await emailService.sendResetPasswordEmail(email, resetToken);
}

async function resetPassword(resetToken: string, password: string) {
  const user = await prisma.user.findUnique({ where: { resetToken } });

  const isExpired =
    !user?.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date();

  if (!user || isExpired) {
    throw ApiError.badRequest('Reset link is invalid or expired');
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    }),
    prisma.token.deleteMany({ where: { userId: user.id } }),
  ]);
}

async function updateName(id: number, name: string) {
  await getByIdOrFail(id);

  const user = await prisma.user.update({
    where: { id },
    data: { name },
  });

  return normalize(user);
}

async function changePassword(
  id: number,
  oldPassword: string,
  newPassword: string,
  currentRefreshToken?: string,
) {
  const user = await getByIdOrFail(id);
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      oldPassword: 'Old password is incorrect',
    });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { password: hash },
    }),
    prisma.token.deleteMany({
      where: {
        userId: id,
        NOT: currentRefreshToken
          ? { refreshToken: currentRefreshToken }
          : undefined,
      },
    }),
  ]);
}

async function changeEmail(id: number, password: string, newEmail: string) {
  const user = await getByIdOrFail(id);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      password: 'Password is incorrect',
    });
  }

  if (newEmail === user.email) {
    throw ApiError.badRequest('Validation error', {
      newEmail: 'This is already your email',
    });
  }

  const existing = await findByEmail(newEmail);

  if (existing) {
    throw ApiError.badRequest('Validation error', {
      newEmail: 'Email is already taken',
    });
  }

  const oldEmail = user.email;

  const updated = await prisma.user.update({
    where: { id },
    data: { email: newEmail },
  });

  await emailService.sendEmailChangedNotice(oldEmail, newEmail);

  return normalize(updated);
}

export const userService = {
  normalize,
  findByEmail,
  findById,
  register,
  activate,
  requestPasswordReset,
  resetPassword,
  updateName,
  changePassword,
  changeEmail,
};
