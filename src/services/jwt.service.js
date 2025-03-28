import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '50s',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
}

function signReset(user) {
  const token = jwt.sign(user, process.env.JWT_RESET_KEY, {
    expiresIn: '600',
  });

  return token;
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
  verifyRefresh,
  signRefresh,
  signReset,
};
