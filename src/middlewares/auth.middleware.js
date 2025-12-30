'use strict';

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('email не авторизовано');
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).send('email не авторизовано');
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (error) {
    return res.status(401).send('недійсний токен');
  }
};

module.exports = authMiddleware;
