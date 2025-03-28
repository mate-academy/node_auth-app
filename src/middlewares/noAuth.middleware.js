const { ApiError } = require('../exceptions/api.error');
const jwtService = require('../services/jwt.service');

const noAuthMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (authorization || token) {
    throw ApiError.forbidden();
  }

  const userData = jwtService.verify(token);

  if (userData) {
    throw ApiError.forbidden();
  }

  next();
};

module.exports = {
  noAuthMiddleware,
};
