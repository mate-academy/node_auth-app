import jwt from 'jsonwebtoken';
import { ApiError } from '../exceptions/apiError.js';

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, { expiresIn: '1h' });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    throw ApiError.badRequest(e.message);
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY, { expiresIn: '1h' });
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    throw ApiError.badRequest(e.message);
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
