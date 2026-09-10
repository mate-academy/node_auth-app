import { Token } from '../models/token.js';
import { jwtService } from './jwt.service.js';
import { userService } from './user.service.js';

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken, newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

async function generateAndSaveTokens(user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await save(normalizedUser.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: normalizedUser,
  };
}

export const tokenService = {
  save,
  getByToken,
  remove,
  generateAndSaveTokens,
};
