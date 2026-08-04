import { Token } from '../models/token.js';

async function save(userId, newToken) {
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
  return Token.destroy({ where: { userId } });
}

function saveResetToken(userId, resetToken) {
  return Token.upsert({ userId, resetToken });
}

function getResetToken(userId) {
  return Token.findOne({ where: { userId } });
}

function removeResetToken(userId) {
  return Token.update({ resetToken: null }, { where: { userId } });
}

export const tokenService = {
  save,
  getByToken,
  remove,
  saveResetToken,
  getResetToken,
  removeResetToken,
};
