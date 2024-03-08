'use strict';

require('dotenv/config');

function createClientUrl(pathname) {
  const hashPart = process.env.CLIENT_URL_HASHED ? '/#' : '';

  return process.env.CLIENT_URL + hashPart + pathname;
}

module.exports = { createClientUrl };
