const { ApiError } = require('../exceptions/api.error');
const jwtService = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  res.userData = userData;

  next();
};

const nonAuthMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  const userData = jwtService.verify(token);

  if (userData) {
    throw ApiError.forbidden('You are already logged in');
  }

  next();
};

module.exports = {
  authMiddleware,
  nonAuthMiddleware,
};
