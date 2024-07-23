const jwt = require('jsonwebtoken');

// Access Token
const createAccessToken = (user) => {
  const publicUserData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET, {
    expiresIn: '10s',
  });
};

const verifyAccessToken = (accessToken) => {
  try {
    return jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Refresh Token
const createRefreshToken = (user) => {
  const publicUserData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET_REFRESH, {
    expiresIn: '30s',
  });
};

const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
  } catch (error) {
    return null;
  }
};

// Password Reset Token
const createResetToken = (user) => {
  const publicUserData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(publicUserData, process.env.JWT_SECRET_RESET, {
    expiresIn: '24h',
  });
};

const verifyResetToken = (resetToken) => {
  try {
    return jwt.verify(resetToken, process.env.JWT_SECRET_RESET);
  } catch {
    return null;
  }
};

module.exports = {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  createResetToken,
  verifyResetToken,
};
