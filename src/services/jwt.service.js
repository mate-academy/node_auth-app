require('dotenv/config');

const jsonwebtoken = require('jsonwebtoken');

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH = process.env.JWT_REFRESH_SECRET;

function sign(user) {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '10m' });
}

function verify(token) {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

function signRefresh(user) {
  return jsonwebtoken.sign(user, REFRESH);
}

function verifyRefresh(token) {
  try {
    return jsonwebtoken.verify(token, REFRESH);
  } catch (error) {
    return null;
  }
}

exports.jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};
