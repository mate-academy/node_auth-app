const jwt = require('jsonwebtoken');
const { ONE_WEEK } = require('../constants');
const { userNormalize } = require('../models/user.model/user.model');

require('dotenv').config();

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, { expiresIn: ONE_WEEK });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY);
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
}

function generateTokens(user) {
  const normalizedUser = userNormalize(user);
  const accessToken = sign(normalizedUser);
  const refreshToken = signRefresh(normalizedUser);

  normalizedUser.token = accessToken;
  normalizedUser.refreshToken = refreshToken;

  return { normalizedUser, refreshToken, accessToken };
}

module.exports = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  generateTokens,
};
