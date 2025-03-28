import { Token } from '../models/token.model.js';

async function save(userId, newToken) {
  const token = await Token.findOne({
    where: { userId },
  });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function removeToken(userId) {
  return Token.destroy({
    where: { userId },
  });
}

export const tokenService = {
  save,
  getByToken,
  removeToken,
};
