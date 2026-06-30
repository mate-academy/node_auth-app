'use strict';

const jwt = require('../utils/jwt.js');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = userData;

  next();
}

module.exports = {
  authMiddleware,
};
