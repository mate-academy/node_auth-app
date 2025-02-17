import jsonwebtoken from 'jsonwebtoken';

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '3m',
  });
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

function generateResetToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_RESET_SECRET, {
    expiresIn: '15m',
  });
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

function validateResetToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_RESET_SECRET);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  generateResetToken,
  validateResetToken,
};
