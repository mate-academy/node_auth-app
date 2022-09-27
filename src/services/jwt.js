const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '60s' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function validateAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
