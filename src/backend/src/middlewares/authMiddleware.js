'use strict';

const jwtService = require('../services/jwt.service');
const { ApiError } = require('../utils/ApiError');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(ApiError.unauthorized());
  }

  const payload = jwtService.verify(token);

  if (!payload) {
    return next(ApiError.unauthorized());
  }

  req.user = payload;
  next();
}

module.exports = { authMiddleware };
