require('dotenv').config();

const jwt = require('jsonwebtoken');

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_ACCESS_TTL,
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: process.env.JWT_REFRESH_TTL,
  });

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch {
    return null;
  }
}

function signReset(user) {
  const token = jwt.sign(user, process.env.JWT_RESET_KEY, {
    expiresIn: process.env.JWT_RESET_TTL,
  });

  return token;
}

function verifyReset(token) {
  try {
    return jwt.verify(token, process.env.JWT_RESET_KEY);
  } catch {
    return null;
  }
}

const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  signReset,
  verifyReset,
};

module.exports = { jwtService };
