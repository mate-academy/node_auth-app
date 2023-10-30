'use strict';

const jwtService = require('../services/jwt.service');

const checkRefreshTokenInCookies = async(req, res, next) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    res.status(401).send({ error: 'Unauthorized' });

    return;
  }

  req.userData = userData;
  next();
};

module.exports = {
  checkRefreshTokenInCookies,
};
