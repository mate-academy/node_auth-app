import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { ApiError } from '../utils/ApiError.js';
import { toPublicUser } from '../utils/toPublicUser.js';
import { generateOpaqueToken, hashToken } from '../lib/tokens.js';
import {
  sendEmailChangeConfirmation,
  sendEmailChangeNotice,
} from '../lib/mailer.js';

const EMAIL_CHANGE_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return toPublicUser(user);
}

export async function updateName(userId, name) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  return toPublicUser(user);
}

export async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const isOldPasswordCorrect = await verifyPassword(
    oldPassword,
    user.passwordHash,
  );

  if (!isOldPasswordCorrect) {
    throw new ApiError(
      400,
      'INVALID_PASSWORD',
      'Current password is incorrect',
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function changeEmail(userId, { password, newEmail }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'INVALID_PASSWORD', 'Password is incorrect');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_TAKEN', 'This email is already registered');
  }

  const emailChangeToken = generateOpaqueToken();

  await prisma.verificationToken.create({
    data: {
      type: 'EMAIL_CHANGE',
      tokenHash: hashToken(emailChangeToken),
      userId: user.id,
      payload: newEmail,
      expiresAt: new Date(Date.now() + EMAIL_CHANGE_TOKEN_TTL_MS),
    },
  });

  await sendEmailChangeConfirmation(newEmail, emailChangeToken);
  await sendEmailChangeNotice(user.email, newEmail);
}

export async function confirmEmailChange(rawToken) {
  const tokenHash = hashToken(rawToken);

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { tokenHash },
  });

  const isValid =
    verificationToken &&
    verificationToken.type === 'EMAIL_CHANGE' &&
    !verificationToken.usedAt &&
    verificationToken.expiresAt > new Date();

  if (!isValid) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'This confirmation link is invalid or has expired',
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: verificationToken.payload },
  });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_TAKEN', 'This email is already registered');
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    await tx.user.update({
      where: { id: verificationToken.userId },
      data: { email: verificationToken.payload },
    });

    await tx.refreshToken.updateMany({
      where: { userId: verificationToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });
}
