'use strict';

const jwt = require('jsonwebtoken');

const sign = (user) => {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '15s',
  });

  return token;
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
};

const signRefresh = (user) => {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
