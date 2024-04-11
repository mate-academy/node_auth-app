const jwt = require('jsonwebtoken');
const tokenService = require('../services/token.service.js');

require('dotenv/config');

const createAccessToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

const createRefreshToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '3h',
  });
};

const createEmailActivationToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_EMAIL_SECRET, {
    expiresIn: '24h',
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};

const verifyEmailActivationToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_EMAIL_SECRET);
  } catch (err) {
    return null;
  }
};

const generateTokens = async (res, user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await tokenService.save({ refreshToken, userId: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 3600 * 24,
    secure: true,
  });
  res.send({ user, accessToken });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  createEmailActivationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailActivationToken,
  generateTokens,
};
