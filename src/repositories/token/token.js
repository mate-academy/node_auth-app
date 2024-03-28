'use strict';

const { Token } = require('../../models/token.model.js');
const { TokenRepository } = require('./token.repository.js');

const tokenRepository = new TokenRepository(Token);

module.exports = {
  tokenRepository,
};
