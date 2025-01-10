'use strict';

const JwtService = require('../services/jwt.service');
const ApplicationErrors = require('../../exceptions/application.errors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(ApplicationErrors.Unauthorized());
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    return next(ApplicationErrors.Unauthorized());
  }

  const userData = JwtService.validateAccessToken(accessToken);

  if (!userData) {
    return next(ApplicationErrors.Unauthorized());
  }

  req.user = userData;

  next();
}

module.exports = authMiddleware;
