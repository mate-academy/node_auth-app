const jsonwebtoken = require('jsonwebtoken');

const SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are missing from environment variables.');
}

const generateAccessToken = (user) => {
  return jsonwebtoken.sign(
    { id: user.id, role: user.role }, // Store only necessary info
    SECRET,
    { expiresIn: '10m' },
  );
};

const validateAccessToken = (token) => {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};

const generateRefreshToken = (user) => {
  return jsonwebtoken.sign(
    { id: user.id, role: user.role }, // Store only necessary info
    REFRESH_SECRET,
    { expiresIn: '7d' },
  );
};

const validateRefreshToken = (token) => {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  validateRefreshToken,
  generateRefreshToken,
  generateAccessToken,
  validateAccessToken,
};
