import jwt from 'jsonwebtoken';

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '15m',
  });
}

function verify(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return null;
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: '30d',
  });
}

function verifyRefresh(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
