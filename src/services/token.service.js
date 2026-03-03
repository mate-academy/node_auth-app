import { Token } from '../models/token.js';

async function saveToken(userId, refreshToken) {
  const tokenData = await Token.findOne({ where: { userId } });

  if (tokenData) {
    tokenData.refreshToken = refreshToken;
    await tokenData.save();
  } else {
    await Token.create({ userId, refreshToken });
  }
}

async function removeToken(refreshToken) {
  await Token.destroy({ where: { refreshToken: refreshToken } });
}

async function findByToken(refreshToken) {
  const tokenData = await Token.findOne({
    where: { refreshToken: refreshToken },
  });

  return tokenData;
}

export const tokenService = {
  saveToken,
  removeToken,
  findByToken,
};
