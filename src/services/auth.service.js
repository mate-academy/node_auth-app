import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  generateOpaqueToken,
  getRefreshTokenExpiry,
  hashToken,
  signAccessToken,
} from '../lib/tokens.js';
import { sendActivationEmail, sendPasswordResetEmail } from '../lib/mailer.js';
import { ApiError } from '../utils/ApiError.js';
import { toPublicUser } from '../utils/toPublicUser.js';

const ACTIVATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function register({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_TAKEN', 'This email is already registered');
  }

  const passwordHash = await hashPassword(password);
  const activationToken = generateOpaqueToken();

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, passwordHash },
    });

    await tx.verificationToken.create({
      data: {
        type: 'ACTIVATION',
        tokenHash: hashToken(activationToken),
        userId: newUser.id,
        expiresAt: new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS),
      },
    });

    return newUser;
  });

  await sendActivationEmail(user.email, activationToken);
}

async function createSession(userId) {
  const accessToken = signAccessToken(userId);
  const refreshToken = generateOpaqueToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
}

export async function activateUser(rawToken) {
  const tokenHash = hashToken(rawToken);

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { tokenHash },
  });

  const isValid =
    verificationToken &&
    verificationToken.type === 'ACTIVATION' &&
    !verificationToken.usedAt &&
    verificationToken.expiresAt > new Date();

  if (!isValid) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'This activation link is invalid or has expired',
    );
  }

  const user = await prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    return tx.user.update({
      where: { id: verificationToken.userId },
      data: { isActive: true },
    });
  });

  const { accessToken, refreshToken } = await createSession(user.id);

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
  }

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      'EMAIL_NOT_ACTIVATED',
      'Please activate your account before logging in',
    );
  }

  const { accessToken, refreshToken } = await createSession(user.id);

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Missing refresh token');
  }

  const tokenHash = hashToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  const isValid =
    storedToken && !storedToken.revokedAt && storedToken.expiresAt > new Date();

  if (!isValid) {
    throw new ApiError(
      401,
      'INVALID_REFRESH_TOKEN',
      'Invalid or expired refresh token',
    );
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const session = await createSession(storedToken.userId);

  return { ...session, user: toPublicUser(storedToken.user) };
}

export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) {
    return;
  }

  const tokenHash = hashToken(rawRefreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return; // never reveal whether an email is registered
  }

  const resetToken = generateOpaqueToken();

  await prisma.verificationToken.create({
    data: {
      type: 'PASSWORD_RESET',
      tokenHash: hashToken(resetToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);
}

export async function confirmPasswordReset(rawToken, newPassword) {
  const tokenHash = hashToken(rawToken);

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { tokenHash },
  });

  const isValid =
    verificationToken &&
    verificationToken.type === 'PASSWORD_RESET' &&
    !verificationToken.usedAt &&
    verificationToken.expiresAt > new Date();

  if (!isValid) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'This reset link is invalid or has expired',
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    await tx.user.update({
      where: { id: verificationToken.userId },
      data: { passwordHash },
    });

    await tx.refreshToken.updateMany({
      where: { userId: verificationToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });
}
