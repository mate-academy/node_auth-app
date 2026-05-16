import { Token } from '../models/token.js';

async function save(userId, newToken) {
  if (!userId) {
    throw new Error(
      'tokenService.save: Expected userId, but received undefined or null',
    );
  }

  if (!newToken) {
    throw new Error(
      'tokenService.save: A newToken was expected, but none was provided',
    );
  }

  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  Token.destroy({ where: { userId } });
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
