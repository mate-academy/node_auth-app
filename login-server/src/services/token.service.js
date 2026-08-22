import { Token } from '../models/token';

async function save(userId, newToken) {
  const token = Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });
    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

export const tokenService = {
  save,
  getByToken,
};
