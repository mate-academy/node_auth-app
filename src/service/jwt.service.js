import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { ConsoleLoger } from '../untils/consoleLoger.js';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '15m',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    ConsoleLoger.error(error);

    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESHKEY, {
    expiresIn: '30d',
  });

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESHKEY);
  } catch (error) {
    ConsoleLoger.error(error);

    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
