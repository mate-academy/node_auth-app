'use strict';

const { User } = require('./user.model');
const { Token } = require('./token.model');

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });
