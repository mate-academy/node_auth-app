'use strict';

const { AuthToken } = require('./AuthToken');
const { EmailToken } = require('./EmailToken');
const { User } = require('./User');

User.hasMany(AuthToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
AuthToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(EmailToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmailToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  AuthToken,
  EmailToken,
  User,
};
