'use strict';

const jwtService = require('../services/jwtService.js');
const { ApiError } = require('../exceptions/ApiError.js');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiError.Unauthorized();
  }

  const accessToken = authHeader.split(' ')[1];

  if (!accessToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  next();
}

module.exports = {
  authMiddleware,
};
