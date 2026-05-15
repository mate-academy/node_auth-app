import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, { expiresIn: '20m' });
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY || 'refresh_secret', {
    expiresIn: '30d',
  });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return null;
  }
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY || 'refresh_secret');
  } catch {
    return null;
  }
}

export const jwtService = {
  sign,
  signRefresh,
  verify,
  verifyRefresh,
};
