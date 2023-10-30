'use strict';

const checkRefreshTokenInCookies = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401).send({
      error: 'Refresh token not found in cookies',
    });

    return;
  }
  next();
};

module.exports = {
  checkRefreshTokenInCookies,
};
