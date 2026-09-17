'use strict';

const jwt = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    res.status(401).json({ message: 'Token is require' });

    return;
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'invalid token' });

    return;
  }

  req.user = userData;

  next();
};

module.exports = {
  authMiddleware,
};
