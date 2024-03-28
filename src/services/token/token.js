'use strict';

const { tokenRepository } = require('../../repositories/token/token.js');
const { TokenService } = require('./token.service.js');

const tokenService = new TokenService(tokenRepository);

module.exports = {
  tokenService,
};
