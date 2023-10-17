import jwt from 'jsonwebtoken';

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, { expiresIn: '1h' });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY, { expiresIn: '1h' });
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
