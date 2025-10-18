// src/middleware/auth.js
const { verifyAccessToken } = require('../services/tokenService');

module.exports = function auth(req, res, next) {
  const bearer = req.header('Authorization')?.replace('Bearer ', '');
  const cookieToken = req.cookies?.accessToken;
  const token = bearer || cookieToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
