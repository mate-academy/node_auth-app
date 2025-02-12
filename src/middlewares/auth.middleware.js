'use strict';

const jwtService = require('../services/jwt.service');

const authMiddleWare = (req, res, next) => {
  const authorization = req.headers['authorization'] || null;

  if (!authorization) {
    res.status(401).send('Authorization header is missing or malformed');

    return;
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    res.status(401).send('Authorization header is missing or malformed');

    return;
  }

  try {
    const userData = jwtService.verify(token);

    if (!userData) {
      return res.status(401).send('Token verification failed');
    }

    req.user = userData;

    next();
  } catch (error) {
    return res.status(401).send('Token verification failed');
  }
};

module.exports = {
  authMiddleWare,
};
