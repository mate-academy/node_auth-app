'use strict';

const { jwt } = require('../utils/jwt.js');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const [, accessToken] = (authHeader || '').split(' ');

  if (!accessToken) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  req.user = userData;
  next();
}

module.exports = { authMiddleware };
