const jwt = require('jsonwebtoken');

function sing(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '30s' });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

function singRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    return null;
  }
}

module.exports = {
  sing,
  verify,
  singRefresh,
  verifyRefresh,
};
