'use strict';

const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../utils/api.error');

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    throw ApiError.Unauthorized();
  }

  const [, token] = auth.split(' ');

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const tokenData = jwtService.readAccessToken(token);

  if (tokenData === null) {
    throw ApiError.Unauthorized();
  }

  next();
};

exports.authMiddleware = authMiddleware;
