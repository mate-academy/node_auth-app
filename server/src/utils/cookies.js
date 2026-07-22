'use strict';

const { env } = require('../config/env');

const accessCookieOptions = {
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', accessCookieOptions);
  res.clearCookie('refreshToken', refreshCookieOptions);
}

module.exports = {
  clearAuthCookies,
  setAuthCookies,
};
