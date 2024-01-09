'use strict';

const { verify } = require('../services/jwt.service');
const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};

module.exports = {
  authMiddleware,
};
