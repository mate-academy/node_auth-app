const { jsonwebtoken } = require('jsonwebtoken');

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (user) => {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '10m' });
};

const validateAccessToken = (token) => {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};

const generateRefreshToken = (user) => {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
};

const validateRefreshToken = (token) => {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  validateRefreshToken,
  generateRefreshToken,
  generateAccessToken,
  validateAccessToken,
};
