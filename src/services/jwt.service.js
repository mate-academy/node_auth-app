import jwt from 'jsonwebtoken';
import { userService } from './user.service.js';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '2h',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: '30d',
  });

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
}

async function generatePair(res, user) {
  const accessToken = sign(user);
  const refreshToken = signRefresh(user);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 2 * 60 * 60 * 1000,
  }); // 2 години

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }); // 30 днів

  await userService.updateRefreshToken(user.id, refreshToken);
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  generatePair,
};
