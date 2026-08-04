import { Token } from '../models/token.js';

async function save(userId, newToken) {
  const token = await Token.findOne({
    where: { userId },
  });

  if (!token) {
    return Token.create({
      userId,
      refreshToken: newToken,
    });
  }

  token.refreshToken = newToken;

  return token.save();
}

function getByToken(refreshToken) {
  if (!refreshToken) {
    return null;
  }

  return Token.findOne({
    where: { refreshToken },
  });
}

function remove(userId) {
  return Token.destroy({
    where: { userId },
  });
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
