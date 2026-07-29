const { ApiError } = require('../controllers/expations/api.error');
const { jwtService } = require('../services/jwt.service');

const guestMiddleware = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    throw ApiError.badRequest('Ви вже авторизовані в системі');
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.badRequest('Ви вже авторизовані в системі');
  }

  next();
};

module.exports = { guestMiddleware };
