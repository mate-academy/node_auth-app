'use strict';

const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters long and contain at least ' +
  'one letter and one number';

function isValidPassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
}

module.exports = {
  isValidPassword,
  PASSWORD_RULE_MESSAGE,
};
