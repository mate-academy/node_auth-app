const jwtService = require('../services/jwt.service.js');
const { ApiError } = require('../exeptions/apiError');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const accessToken = authorization.split(' ')[1];

  const user = jwtService.verifyAccessToken(accessToken);

  if (!authorization || !accessToken || !user) {
    throw ApiError.unauthorized();
  }

  next();
};

module.exports = {
  authMiddleware,
};
