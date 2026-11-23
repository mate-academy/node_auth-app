import { Token } from '../models/token.js';

async function save(userId, refreshToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken });

    return;
  }

  token.refreshToken = refreshToken;
  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

export const tokenService = {
  save,
  getByToken,
};
