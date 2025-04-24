require('dotenv/config');

const jwt = require('jsonwebtoken');

function sign(user) {
  const token = jwt.sign({ email: user.email }, process.env.JWT_KEY, {
    expiresIn: '15m',
  });

  return token;
}

function refreshSign(user) {
  const token = jwt.sign({ email: user.email }, process.env.JWT_REFRESHKEY);

  return token;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESHKEY);
  } catch (err) {
    return null;
  }
}

exports.jwtService = {
  sign,
  refreshSign,
  verifyToken,
  verifyRefreshToken,
};
