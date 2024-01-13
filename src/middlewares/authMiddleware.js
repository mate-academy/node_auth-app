'use strict';

const jwtService = require('../services/jwt.service.js');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    // eslint-disable-next-line no-useless-return
    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);

    // eslint-disable-next-line no-useless-return
    return;
  }

  next();
};

module.exports = {
  authMiddleware,
};
