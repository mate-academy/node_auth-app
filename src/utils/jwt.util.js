import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';

const generateAccessToken = (user) => {
  return jsonwebtoken.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10m',
  });
};

const validateAccessToken = (token) => {
  try {
    return jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

const generateRefreshToken = (user) => {
  return jsonwebtoken.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
};

const validateRefreshToken = (token) => {
  try {
    return jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

export const jwt = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
