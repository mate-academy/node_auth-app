import jwt from 'jsonwebtoken';
import 'dotenv/config';

function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '60m' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '60m' });
}

function generateResetPasswordToken(user) {
  return jwt.sign(user, process.env.JWT_RESET_SECRET, { expiresIn: '10m' });
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

function validateResetPasswordToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_RESET_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  validateAccessToken,
  validateRefreshToken,
  validateResetPasswordToken,
};
