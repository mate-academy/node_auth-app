import { Token } from '../models/token.js';

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

async function getByToken(refreshToken) {
  return Token.findOne({ whare: refreshToken });
}

async function remove(userId) {
  return Token.destroy({ where: { userId } });
}

export const tokenSerice = {
  save,
  getByToken,
  remove,
};
