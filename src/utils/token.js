const jwt = require('jsonwebtoken');

// Generate a JWT token for a specific user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// Verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null; // Return null if the token is invalid or expired
  }
};

module.exports = { generateToken, verifyToken };
