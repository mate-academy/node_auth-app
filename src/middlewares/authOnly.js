const { jwtService } = require('../services/jwt.service.js');
const { ApiError } = require('../exeptions/api.error.js');

function authOnly(req, _, next) {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');
  const refreshToken = req.cookies && req.cookies.refreshToken;

  let userData = null;

  if (token) {
    userData = jwtService.verify(token);
  } else if (refreshToken) {
    userData = jwtService.verifyRefresh(refreshToken);
  }

  if (!userData) {
    return next(ApiError.unauthorized());
  }

  req.user = userData;
  next();
}

module.exports = { authOnly };
