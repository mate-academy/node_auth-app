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

async function getByToken(refreshToken) {
  const token = await Token.findOne({ where: { refreshToken } });

  return token;
}

async function remove(id) {
  const dToken = await Token.destroy({ where: { id } });

  return dToken;
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
