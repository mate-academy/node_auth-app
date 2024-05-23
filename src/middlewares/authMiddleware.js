const { ApiError } = require('../exeptions/api.error.js');
const jwtService = require('../services/jwt.service.js');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const [, token] = authHeader.split(' ');

  if (!authHeader || !token) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.verifyAccessTokens(token);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  req.user = userData;
  next();
};

module.exports = { authMiddleware };
