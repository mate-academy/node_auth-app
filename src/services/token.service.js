import { Token } from '../models/Token.js';

async function saveToken(userId, newToken) {
  const tokenData = await Token.findOne({ where: { userId } });

  if (!tokenData) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  tokenData.refreshToken = newToken;
  await tokenData.save();

  return tokenData;
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function removeById(userId) {
  return Token.destroy({ where: { userId } });
}

export const tokenService = {
  saveToken,
  getByToken,
  removeById,
};
