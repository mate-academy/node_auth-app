'use strict';

const jwt = require('../utils/jwt');

const { Token } = require('../model/token.model');

const validateEmail = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

async function updateTokens(user) {
  const accessToken = jwt.generateAccessToken(user);
  const refreshToken = jwt.generateRefreshToken(user);

  await Token.destroy({ where: { userId: user.id } });
  await Token.create({ userId: user.id, token: refreshToken });

  return { user: user, accessToken, refreshToken };
}

const removeRefreshToken = (userId) => {
  return Token.destroy({ where: { userId } });
};

module.exports = {
  validateEmail,
  validatePassword,
  updateTokens,
  removeRefreshToken,
};
