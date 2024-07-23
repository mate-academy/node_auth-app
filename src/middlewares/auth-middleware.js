const { ApiError } = require('../exceptions/API-error.js');
const { verifyAccessToken } = require('../services/jwt-service.js');
const { parseAccessToken } = require('../utils/parseAccessToken.js');

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    throw ApiError.Unauthorized();
  }

  const accessToken = parseAccessToken(auth);

  if (!accessToken) {
    throw ApiError.Unauthorized();
  }

  const result = verifyAccessToken(accessToken);

  if (result === null) {
    throw ApiError.Unauthorized();
  }

  next();
};

module.exports = { authMiddleware };
