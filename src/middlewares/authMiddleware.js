'use strict';

const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exceptions/api.error');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  next();
};

module.exports = { authMiddleware };
