const jwtService = require('../services/jwt.service');
const { ApiError } = require('../utils/api.error');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    throw ApiError.badRequest('Token is required');
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.badRequest('Invalid token');
  }

  next();
}

module.exports = { authMiddleware };
