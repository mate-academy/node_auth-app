import { Token } from '../models/token.model.js';

async function save(userId, refreshToken) {
  const token = await Token.findOne({ where: { userId } });

  if (token) {
    token.refreshToken = refreshToken;

    return token.save();
  }

  await Token.create({ userId, refreshToken });
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

async function remove(userId) {
  return Token.destroy({ where: { userId } });
}

export const tokensService = {
  save,
  getByToken,
  remove,
};
