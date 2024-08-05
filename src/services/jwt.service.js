import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '1h'
  });
  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    console.error('Access token verification failed:', error.message);
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: '7d'
  });
  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    return null;
  }
}

function signResetToken(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '1h'
  });
  return token;
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  signResetToken,
};
