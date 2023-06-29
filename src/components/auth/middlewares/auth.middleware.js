'use strict';

const JwtService = require('../services/jwt.service');
const ExceptionsErrors = require('../../exceptions/exceptions.errors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ExceptionsErrors.Unauthorized();
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ExceptionsErrors.Unauthorized();
  }

  const userData = JwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ExceptionsErrors.Unauthorized();
  }

  next();
};

module.exports = authMiddleware;
