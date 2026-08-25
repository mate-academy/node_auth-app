'use strict';

const { ApiError } = require('../utils/ApiError.js');
const { jwt } = require('../utils/jwt.js');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApiError.unauthorized('Access token is required');
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.unauthorized('Access token is not valid');
  }

  req.user = userData;
  next();
}

module.exports = { authMiddleware };
