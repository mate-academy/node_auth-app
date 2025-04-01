const { verifyRefresh } = require('../services/jwtService');
const { ApiError } = require('../exceptions/apiError');

async function authMiddleware(req, res, next) {
  const { refreshToken } = req.cookies;

  const userData = await verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  next();
}

module.exports = {
  authMiddleware,
};
