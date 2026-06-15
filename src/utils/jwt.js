const jwt = require('jsonwebtoken');

const secretAccess = process.env.JWT_ACCESS_SECRET || '';

const getAccessToken = (payload) => {
  return jwt.sign(payload, secretAccess, { expiresIn: '24h' });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, secretAccess);
  } catch {
    return null;
  }
};

module.exports = {
  getAccessToken,
  verifyAccessToken,
};
