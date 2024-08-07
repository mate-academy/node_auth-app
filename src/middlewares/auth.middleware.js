const { ApiError } = require('../exceptions/api.error');
const jwtService = require('../services/jwt.service');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
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
