const { ApiError } = require('../exceptions/api.error');
const jwtService = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  next();
};

module.exports = {
  authMiddleware,
};
