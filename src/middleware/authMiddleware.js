const { ApiError } = require('../exeptions/api.error.js');
const { jwtService } = require('../services/jwt.service.js');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiError.unauthorized('Token is required');
  }

  const [, accessToken] = authHeader.split(' ');

  if (!authHeader) {
    throw ApiError.unauthorized('Token is required');
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.unauthorized('Invalid token');
  }

  req.user = userData;

  next();
};

module.exports = {
  authMiddleware,
};
