const { jwtService } = require('../services/jwt.service.js');
const { ApiError } = require('../exeptions/api.error.js');

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

  req.user = userData;
  next();
};

module.exports = { authMiddleware };
