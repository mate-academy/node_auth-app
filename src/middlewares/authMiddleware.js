const { ApiError } = require('../exeptions/auth.error');
const { jwtServices } = require('../services/jwt.services');
const { usersServices } = require('../services/users.services');

module.exports = {
  authMiddleware: async (req, _, next) => {
    const authorizationHeader = 'authorization';

    const token =
      (req.headers[authorizationHeader] &&
        req.headers[authorizationHeader].split(' ')[1]) ||
      req.cookies.token;

    if (!token) {
      throw ApiError.unauthorized('Authorization token is missing');
    }

    const refreshKey = process.env.JW_REFRESH_KEY;

    if (!refreshKey) {
      throw new Error('Environment variable JW_REFRESH_KEY is not set');
    }

    let email;

    try {
      ({ email } = jwtServices.verify(token, refreshKey));
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await usersServices.getUserByEmail(email);

    if (!user) {
      throw ApiError.badRequest('Invalid token: user not found');
    }

    req.refreshToken = token;

    next();
  },
};
