import jwt from 'jsonwebtoken';

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_KEY);
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY);
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
};

const validateRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
};

export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
