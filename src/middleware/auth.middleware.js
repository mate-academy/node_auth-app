'use strict';

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      message: 'Authorization header is missing',
    });
  }

  const [bearer, token] = authorizationHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Invalid authorization format',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret',
    );

    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}

module.exports = {
  authMiddleware,
};
