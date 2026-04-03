'use strict';

const jwt = require('jsonwebtoken');

function guestMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next();
  }

  const [bearer, token] = authorizationHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');

    return res.status(403).json({
      message: 'This route is available only for non-authenticated users',
    });
  } catch (error) {
    return next();
  }
}

module.exports = {
  guestMiddleware,
};
