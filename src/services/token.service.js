import { Token } from '../models/token.model.js';

async function save(userId, newToken) {
  let token = await Token.findOne({ where: { userId } });

  if (!token) {
    token = await Token.create({ userId, refreshToken: newToken });
  } else {
    token.refreshToken = newToken;
    await token.save();
  }

  return token;
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function removeToken(userId) {
  Token.destroy({ where: { userId } });
}

export const tokenService = {
  save,
  getByToken,
  removeToken,
};
