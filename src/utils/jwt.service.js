import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();

function sign(user) {
  const newToken = jwt.sign(user, process.env.JWT_ACCESS, {
    expiresIn: '15min',
  });

  return newToken;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS);
  } catch (e) {
    return false;
  }
}

function signRefresh(user) {
  const newToken = jwt.sign(user, process.env.JWT_REFRESH, {
    expiresIn: '15min',
  });

  return newToken;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH);
  } catch (e) {
    return false;
  }
}

export const tokenService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
