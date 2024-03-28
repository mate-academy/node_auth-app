'use strict';

const { tokenService } = require('../../services/token/token.js');
const { ApiError } = require('../exceptions/api-error.js');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiError.Unauthorized();
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApiError.Unauthorized();
  }

  const userData = tokenService.getAccessTokenPayload(accessToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  req.tokenUserData = userData;

  next();
};

module.exports = {
  authMiddleware,
};
