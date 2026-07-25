'use strict';

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });

    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
