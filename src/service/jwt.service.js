const jsonwebtoken = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, ACCESS_SECRET, { expiresIn: '100s' });
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '1d' });
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  jwt: {
    generateAccessToken,
    generateRefreshToken,
    validateAccessToken,
    validateRefreshToken,
  },
};
