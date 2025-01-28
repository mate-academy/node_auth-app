'use strict';

import jwt from 'jsonwebtoken';

const sign = (user) => {
  return jwt.sign(user, process.env.JWT_KEY);
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
};

const signRefresh = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY);
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
};

export const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
