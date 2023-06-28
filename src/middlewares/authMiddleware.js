'use strict';

const jwtService = require('../services/jwtService.js');
const { ApiError } = require('../exceptions/ApiError.js');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];
  const userData = accessToken && jwtService.validateAccessToken(accessToken);

  if (!authHeader || !accessToken || !userData) {
    return next(ApiError.Unauthorized());
  }

  next(userData);
}

module.exports = {
  authMiddleware,
};
