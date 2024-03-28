'use strict';

const { cookieMaxAge, Tokens } = require('../../libs/enums/enums.js');

const sendAuthentication = async(res, authData) => {
  const { user, accessToken, refreshToken } = authData;

  res.cookie(Tokens.REFRESH_TOKEN, refreshToken, {
    maxAge: cookieMaxAge,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user,
    accessToken,
  });
};

module.exports = {
  sendAuthentication,
};
