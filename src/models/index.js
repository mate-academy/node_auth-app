'use strict';

const { User } = require('./User.model');
const { Token } = require('./Token.model');

User.hasMany(Token, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = {
  User,
  Token,
};
