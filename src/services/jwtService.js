
import 'dotenv/config';

import jwt from 'jsonwebtoken';

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, { expiresIn: '10m' });
};

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
};

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY, { expiresIn: '30d' });
};

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
};

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
