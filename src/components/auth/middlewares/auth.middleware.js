'use strict';

const JwtService = require('../services/jwt.service');
const ApplicationErrors = require('../../exceptions/application.errors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApplicationErrors.Unauthorized();
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApplicationErrors.Unauthorized();
  }

  const userData = JwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApplicationErrors.Unauthorized();
  }

  next(req.user);
};

module.exports = authMiddleware;
