import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET || !process.env.JWT_SECRET_REFRESH) {
  throw new Error('JWT_SECRET and JWT_SECRET_REFRESH must be defined in env');
}

export const createAccessToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const verifyAccessToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};

export const createRefreshToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_REFRESH, { expiresIn: '30d' });
};

export const verifyRefreshToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET_REFRESH);
  } catch (e) {
    return null;
  }
};
