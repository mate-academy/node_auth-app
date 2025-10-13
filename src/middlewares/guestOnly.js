const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exeptions/api.error.js');

function guestOnly(req, _, next) {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');
  const refreshToken = req.cookies && req.cookies.refreshToken;

  let userData = null;

  if (token) {
    userData = jwtService.verify(token);
  } else if (refreshToken) {
    userData = jwtService.verifyRefresh(refreshToken);
  }

  if (userData) {
    req.user = userData;

    return next(ApiError.unauthorized());
  }

  req.user = null;
  next();
}

module.exports = { guestOnly };
