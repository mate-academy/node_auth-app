const jwt = require('jsonwebtoken');

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY);
  return token;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

module.exports = { sign, verifyToken };
