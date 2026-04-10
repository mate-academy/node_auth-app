import { Token } from '../models/token.js';

async function save(userId, newRefreshToken) {
  const token = await Token.findOne({
    where: { userId },
  });

  if (!token) {
    await Token.create({
      userId,
      refreshToken: newRefreshToken,
    });

    return;
  }

  token.refreshToken = newRefreshToken;
  await token.save();
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
  getByToken,
  remove,
};
