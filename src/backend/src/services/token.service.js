import { Token } from '../models/token.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

async function save(userId, refreshToken) {
  const token = await Token.findOne({
    where: { userId },
  });

  if (token) {
    token.refreshToken = refreshToken;

    await token.save();

    return;
  }

  await Token.create({ userId, refreshToken });
}

async function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

async function remove(userId) {
  return Token.destroy({ where: { userId } });
}

async function generateTokens(res, user) {
  const normalizedUser = userService.normalizeData(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

export const tokenService = {
  save,
  getByToken,
  remove,
  generateTokens,
};
