'use strict';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function getRefreshToken(req) {
  const fromCookie = req.cookies && req.cookies[REFRESH_TOKEN_COOKIE];
  const fromBody = req.body && req.body.refreshToken;

  return fromCookie || fromBody || null;
}

module.exports = {
  REFRESH_TOKEN_COOKIE,
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshToken,
};
