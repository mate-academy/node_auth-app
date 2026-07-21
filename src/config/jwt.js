const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_ACCESS_SECRET || '';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  }
  return jwt.sign(payload, SECRET, { expiresIn: '10m' });
};

const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  }
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};

const validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
