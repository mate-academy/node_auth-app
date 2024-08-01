const { ApiError } = require('./../exceptions/api.error');

const { verifyRefresh } = require('../services/jwt.service');

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
