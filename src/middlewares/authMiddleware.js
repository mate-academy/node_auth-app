'use strict';

const { ApiError } = require('../exceptions/api.error');
const { jwtService } = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiError.unAuthorized('Auth header is absent!');
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApiError.unAuthorized('accessToken is missing!');
  }

  const userData = jwtService.verifyToken(accessToken, 'JWT_ACCESS_SECRET');

  if (!userData) {
    throw ApiError.unAuthorized("There's no such accessToken for this user!");
  }

  next();
};

module.exports = { authMiddleware };
