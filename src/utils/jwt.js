import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '30s' });
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

export const jwt = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
