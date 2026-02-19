/* eslint-disable no-console */
import jwt from 'jsonwebtoken';

function sign(user) {
  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: '15m',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    console.error('JWT Verification Error:', err.message);

    return null;
  }
}

function signRefresh(user) {
  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    expiresIn: '30d',
  });

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (err) {
    console.error('JWT Verification Error:', err.message);

    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
