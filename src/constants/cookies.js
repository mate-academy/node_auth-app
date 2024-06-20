const { ONE_WEEK, ONE_MONTH } = require('.');

const COOKIES = {
  login: 'login',
  refresh: 'refresh',
};

function COOKIE_OPTIONS(typeOfCookie) {
  return {
    maxAge: typeOfCookie === COOKIES.login ? ONE_WEEK : ONE_MONTH,
    samesite: 'none',
    httpOnly: true,
  };
}

module.exports = {
  COOKIES,
  COOKIE_OPTIONS,
};
