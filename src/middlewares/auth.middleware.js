'use strict';

const jwt = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwt.validateAccessToken(token);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  req.user = userData;
  next();
}

module.exports = {
  authMiddleware,
};
