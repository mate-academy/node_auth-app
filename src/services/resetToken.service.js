import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import nodeCrypto from 'crypto';

function getByUserId(userId) {
  return db.resetToken.findUnique({
    where: {
      userId,
    },
  });
}

function getByTokenId(tokenId) {
  return db.resetToken.findUnique({
    where: {
      id: Number(tokenId),
    },
  });
}

function checkResetData(token) {
  const NOW = new Date();
  const INTERVAL = 5 * 60 * 1000;
  const { resetInterval } = token;

  if (!resetInterval) {
    return;
  }

  const elapsed = NOW.getTime() - resetInterval.getTime();

  if (elapsed < INTERVAL) {
    throw new Error('You can request password reset only once every 5 minutes');
  }
}

async function createOrUpdate(userId, token) {
  try {
    const { resetExpires, resetTokenHash, resetInterval } =
      await createResetTokenData(token);

    return await db.resetToken.upsert({
      where: { userId },
      update: { resetTokenHash, resetExpires, resetInterval },
      create: {
        userId,
        resetTokenHash,
        resetExpires,
        resetInterval,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function createResetTokenData(token) {
  const saltRounds = 10;
  const resetExpires = new Date(Date.now() + 15 * 60 * 1000);
  const resetInterval = new Date(Date.now());
  const resetTokenHash = await bcrypt.hash(token, saltRounds);

  return {
    resetExpires,
    resetTokenHash,
    resetInterval,
  };
}

function createToken() {
  const resetToken = nodeCrypto.randomBytes(32).toString('hex');

  return resetToken;
}

async function deleteResetToken(userId) {
  return db.resetToken
    .delete({
      where: { userId },
    })
    .catch(() => null);
}

async function checkPassword(token, hashToken) {
  const isValid = await bcrypt.compare(token, hashToken);

  if (!isValid) {
    throw new Error('Invalid reset token');
  } else {
  }
}

export const tokenResetService = {
  getByUserId,
  checkResetData,
  createOrUpdate,
  createToken,
  deleteResetToken,
  getByTokenId,
  checkPassword,
};
