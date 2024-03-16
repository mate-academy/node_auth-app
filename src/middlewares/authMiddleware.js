'use strict';

const { ApiError } = require('../exceptions/ApiError');
const jwtService = require('../services/jwt.service');

const authMiddleware = async(req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      next();
    } else {
      const authorization = req.get('Authorization');

      if (!authorization) {
        throw ApiError.Unauthorized();
      }

      const accessToken = authorization.split(' ')[1];

      if (!accessToken) {
        throw ApiError.Unauthorized();
      }

      const isTokenValid = jwtService.verify(accessToken);

      if (!isTokenValid) {
        throw ApiError.Unauthorized();
      }

      next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { authMiddleware };
