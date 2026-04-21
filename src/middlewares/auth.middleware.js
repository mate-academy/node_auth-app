const { jwtService, tokenService } = require('../services');
const { ApiError } = require('../exceptions');

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    let userData = null;

    if (authorization.toLowerCase().startsWith('bearer ')) {
      const token = authorization.slice(7);

      if (token) {
        userData = jwtService.validateAccessToken(token);
      }
    }

    if (!userData) {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        const validData = jwtService.validateRefreshToken(refreshToken);

        if (validData) {
          const tokenInDb = await tokenService.getByToken(refreshToken);

          if (tokenInDb) {
            userData = validData;
          }
        }
      }
    }

    if (!userData) {
      return next(ApiError.unauthorized());
    }

    req.user = userData;
    next();
  } catch (error) {
    next(ApiError.unauthorized());
  }
};

module.exports = authMiddleware;
