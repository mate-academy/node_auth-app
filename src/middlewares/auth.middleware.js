'use strict';

const jwtService = require('../services/jwt.service');

const authMiddleWare = (req, res, next) => {
  const authorization = req.headers['authorization'] || null;
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.status(401).send('Not authorization');

    return;
  }

  try {
    const userData = jwtService.verify(token);

    if (!userData) {
      return res.status(401).send('Invalid token');
    }

    req.user = userData;

    next();
  } catch (error) {
    return res.status(401).send('Invalid token');
  }
};

module.exports = {
  authMiddleWare,
};
