const jsonwebtoken = require('jsonwebtoken');

require('dotenv').config();

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const SECRET = process.env.JWT_ACCESS_SECRET;

// jwt.js — FIXED
const jwt = {
  generateAccessToken: ({ id, email, name }) => {
    // ← renamed, fixed payload
    return jsonwebtoken.sign({ id, email, name }, SECRET, { expiresIn: '10m' });
  },
  validateAccessToken: (token) => {
    try {
      return jsonwebtoken.verify(token, SECRET);
    } catch {
      return null;
    }
  },
  generateRefreshToken: ({ id, email, name }) => {
    return jsonwebtoken.sign({ id, email, name }, REFRESH_SECRET, {
      expiresIn: '7d',
    });
  },
  validateRefreshToken: (token) => {
    try {
      return jsonwebtoken.verify(token, REFRESH_SECRET);
    } catch {
      return null;
    }
  },
};

module.exports = {
  jwt,
};
