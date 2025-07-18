import { Token } from '../models/Token.model.js';

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { UserId: userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  return await Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { UserId: userId } });
}
export const tokenService = {
  save,
  getByToken,
  remove,
};
