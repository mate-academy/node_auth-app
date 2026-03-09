'use strict';

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send('Unauthorized');
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const payload = jwt.verify(token, 'secret');

    req.user = payload;

    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};

module.exports = authMiddleware;
