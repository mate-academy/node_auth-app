'use strict';
const jwt = require('jsonwebtoken');

function sing(user) {
  const token = jwt.sign(user, process.env.JWT_KEY);

  return token;
}
function singRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '30s' });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  sing,
  verify,
  singRefresh,
  verifyRefresh,
}
