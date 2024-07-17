const jsonwebtoken = require('jsonwebtoken');
const { normalizeUser } = require('./normalizeUser');

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateAccessToken(user) {
  const normalizedUser = normalizeUser(user);

  return jsonwebtoken.sign(normalizedUser, SECRET, { expiresIn: '10m' });
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
}

function validateRefreshToken(token) {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

const jwt = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};

module.exports = {
  jwt,
};
