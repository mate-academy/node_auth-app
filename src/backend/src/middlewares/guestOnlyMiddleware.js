'use strict';

const jwtService = require('../services/jwt.service');
const { ApiError } = require('../utils/ApiError');

function guestOnlyMiddleware(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header) {
    next();

    return;
  }

  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    next();

    return;
  }

  const payload = jwtService.verify(token);

  if (!payload) {
    next();

    return;
  }

  next(ApiError.badRequest('This action is only available when signed out'));
}

module.exports = { guestOnlyMiddleware };
