const { ApiError } = require('../exceptions/api.error.js');
const jwtService = require('../services/jwt.service.js');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized({
      message: 'Please login',
    });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized({
      message: `Don't try to do this!`,
    });
  }

  next();
};

module.exports = {
  authMiddleware,
};
