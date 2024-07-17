const { Token, initTableTokens } = require('./token.model');
const { User, initTableUsers } = require('./users.model');

const models = {
  Token,
  User,
  initTableUsers,
  initTableTokens,
};

module.exports = {
  models,
};
