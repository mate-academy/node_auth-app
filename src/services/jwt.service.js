import 'dotenv/config';
import jwt from 'jsonwebtoken';

function sign(user) {
  return jwt.sign(user, process.env.JWT_SECRET);
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET);
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
