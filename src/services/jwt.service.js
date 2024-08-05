const jwt = require('jsonwebtoken');

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY);

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
}

module.exports = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
