import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '15m' });

  return token;
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: '1d',
  });

  return token;
}

function verify(token) {
  try {
    // returns object
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
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
