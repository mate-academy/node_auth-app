import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, ACCESS_SECRET, {
    expiresIn: '15m', // ✅ FIX
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, {
    expiresIn: '7d', // ✅ FIX
  });
};

const verify = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch {
    return null;
  }
};

export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  verify,
  verifyRefresh,
};
