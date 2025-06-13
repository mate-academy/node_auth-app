const jwt = require('jsonwebtoken');

const sign = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: 36000,
  });
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};

const signRefresh = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET);
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
};

const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};

module.exports = { jwtService };
