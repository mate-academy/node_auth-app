import jwt from 'jsonwebtoken';

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '1h',
  });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return null;
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY);
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
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
