// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import { ResetToken } from '../model/resetToken.model.js';
import { sha256 } from '../utils/tokenHasher.js';

export const RESET_TTL_MS = 15 * 60 * 1000;

export const generateResetToken = async (userId) => {
  await removeAllUserTokens(userId);

  const token = crypto.randomBytes(48).toString('hex');

  await ResetToken.create({
    userId,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  return token;
};

export const consumeResetToken = async (token) => {
  const resetToken = await ResetToken.findOne({
    where: { tokenHash: sha256(token) },
  });

  if (!resetToken) {
    return null;
  }

  if (Date.now() >= resetToken.expiresAt.getTime()) {
    await removeResetToken(token);

    return null;
  }

  const countOfRemove = await removeResetToken(token);

  if (countOfRemove === 1) {
    return resetToken.userId;
  } else {
    return null;
  }
};

export const removeResetToken = (token) =>
  ResetToken.destroy({ where: { tokenHash: sha256(token) } });

export const removeAllUserTokens = (userId) =>
  ResetToken.destroy({ where: { userId } });
