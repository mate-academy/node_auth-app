import { Token } from '../models/token.js';

async function save(id, newToken) {
  const token = await Token.findOne({ where: { id } });

  if (!token) {
    await Token.create({ id, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(id) {
  return Token.destroy({ where: { id } });
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
