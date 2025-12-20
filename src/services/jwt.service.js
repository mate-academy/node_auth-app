import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function sign(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function signRefresh(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
