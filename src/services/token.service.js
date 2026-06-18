import { Token } from '../models/token.js';

async function save(userId, newToken) {
  await Token.upsert({ userId, refreshToken: newToken });
}

async function getByToken(refreshToken) {
  return await Token.findOne({ where: { refreshToken } });
}

async function remove(userId) {
  await Token.destroy({ where: { userId } });
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
