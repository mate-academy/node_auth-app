// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import { ChangeToken } from '../model/changeToken.model.js';
import { sha256 } from '../utils/tokenHasher.js';

export const CHANGE_TTL_MS = 15 * 60 * 1000;

export const removeChangeToken = (token) =>
  ChangeToken.destroy({ where: { tokenHash: sha256(token) } });

export const removeAllUserTokens = (userId) =>
  ChangeToken.destroy({ where: { userId } });

export const generateChangeToken = async (userId, newEmail) => {
  await removeAllUserTokens(userId);

  const token = crypto.randomBytes(48).toString('hex');

  await ChangeToken.create({
    newEmail,
    userId,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + CHANGE_TTL_MS),
  });

  return token;
};

export const consumeChangeToken = async (token) => {
  const changeToken = await ChangeToken.findOne({
    where: { tokenHash: sha256(token) },
  });

  if (!changeToken) {
    return null;
  }

  if (Date.now() >= changeToken.expiresAt.getTime()) {
    await removeChangeToken(token);

    return null;
  }

  const countOfRemove = await removeChangeToken(token);

  if (countOfRemove === 1) {
    return { userId: changeToken.userId, newEmail: changeToken.newEmail };
  } else {
    return null;
  }
};
