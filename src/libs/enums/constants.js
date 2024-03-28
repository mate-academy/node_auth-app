'use strict';

const cookieMaxAge = 30 * 24 * 60 * 60 * 1000;

const userValidationRules = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 6,
};

module.exports = {
  cookieMaxAge,
  userValidationRules,
};
