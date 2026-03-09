'use strict';

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  const token = header.split(' ')[1];

  try {
    const user = jwt.verify(token, 'secret');

    req.user = user;

    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};

module.exports = authMiddleware;
