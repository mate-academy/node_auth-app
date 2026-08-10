import { Token } from '../models/Token.js';

async function save(userId, refreshToken) {
  const token = await Token.findOne({
    where: { userId },
  });

  if (token) {
    token.refreshToken = refreshToken;

    token.save();

    return;
  }

  await Token.create({ userId, refreshToken });
}

function getByToken(refreshToken) {
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
  remove,
  getByToken,
};
