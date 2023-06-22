import jwt from 'jsonwebtoken';

function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '3600s'});
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '3600000s'});
}

function validateAccessToken(user) {
  try {
    return jwt.verify(user, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(user) {
  try {
    return jwt.verify(user, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
