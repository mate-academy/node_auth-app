// src/middleware/guest.js
const { verifyAccessToken } = require('../services/tokenService');

module.exports = function guest(req, res, next) {
  const bearer = req.header('Authorization')?.replace('Bearer ', '');
  const cookieToken = req.cookies?.accessToken;
  const token = bearer || cookieToken;
  if (!token) return next();
  try {
    verifyAccessToken(token);
    return res.status(403).json({ error: 'Already authenticated' });
  } catch {
    return next();
  }
};
