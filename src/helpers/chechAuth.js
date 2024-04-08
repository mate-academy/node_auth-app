const { ApiError } = require('../exeptions/apiError');
const jwtService = require('../services/jwt.service.js');

const checkAuth = (req) => {
  const authorization = req.headers['authorization'] || '';
  const token = authorization.split(' ')[1];

  const { id } = jwtService.verifyAccessToken(token);

  if (!id) {
    throw ApiError.unauthorized();
  }

  return id;
};

module.exports = {
  checkAuth,
};
