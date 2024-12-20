const { ApiError } = require('../exeptions/auth.error');
const { jwtServices } = require('../services/jwt.services');
const { usersServices } = require('../services/users.services');

module.exports = {
  authMiddleware: async (req, _, next) => {
    const authorization = 'authorization';

    const token =
      (req.headers[authorization] &&
        req.headers[authorization].split(' ')[1]) ||
      req.cookies.token;

    if (!token) {
      throw ApiError.unauthorized('Authorization token is missing');
    }

    const { email } = jwtServices.verify(token, process.env.JW_REFRESH_KEY);

    const user = await usersServices.getUserByEmail(email);

    if (!user) {
      throw ApiError.badRequest('Bad token');
    }

    req.refreshToken = token;

    next();
  },
};
