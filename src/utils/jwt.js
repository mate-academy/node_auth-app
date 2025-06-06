import jsonwebtoken from 'jsonwebtoken';

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESET_SECRET = process.env.JWT_RESET_SECRET;

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '10m' });
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

function generateResetToken(user) {
  return jsonwebtoken.sign(user, RESET_SECRET, { expiresIn: '10m' });
}

function validateResetToken(token) {
  try {
    return jsonwebtoken.verify(token, RESET_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwt = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  generateResetToken,
  validateResetToken,
};
