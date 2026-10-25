'use strict';

const sequelize = require('../config/database');
const defineUser = require('./user');
const defineToken = require('./token');

const User = defineUser(sequelize);
const Token = defineToken(sequelize);

User.hasMany(Token, {
  foreignKey: {
    name: 'userId',
    allowNull: false,
  },
  onDelete: 'CASCADE',
});
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Token,
};
