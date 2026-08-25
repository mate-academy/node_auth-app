'use strict';

const bcrypt = require('bcrypt');

const { jwt } = require('../utils/jwt.js');
const { userService } = require('./user.service.js');
const { tokensRepository } = require('../entity/tokens.repository.js');

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const IS_PROD = process.env.NODE_ENV === 'production';

// sameSite: 'none' + secure потрібні лише коли клієнт і API на різних сайтах —
// це випадок продакшену. На localhost клієнт і API це один site (порт не
// впливає на same-site), а secure по http підтримують не всі браузери,
// тому в деві cookie просто не збереглася б.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: IS_PROD ? 'none' : 'lax',
  secure: IS_PROD,
  path: '/',
};

function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

// Браузер видалить cookie тільки якщо атрибути збігаються з тими,
// з якими вона ставилась.
function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, REFRESH_COOKIE_OPTIONS);
}

async function sendAuthentication(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(normalizedUser);
  const refreshToken = jwt.generateRefreshToken(normalizedUser);

  await tokensRepository.save(user.id, refreshToken);

  setRefreshCookie(res, refreshToken);

  res.send({ user: normalizedUser, accessToken });
}

module.exports = {
  authService: {
    REFRESH_TOKEN_COOKIE,
    hashPassword,
    comparePasswords,
    setRefreshCookie,
    clearRefreshCookie,
    sendAuthentication,
  },
};
