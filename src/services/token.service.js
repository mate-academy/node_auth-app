import { Token } from '../models/token.js';

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  await Token.findOne({ where: { refreshToken } });
}

async function remove(userId) {
  await Token.destroy({ where: { userId } });
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
