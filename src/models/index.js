'use strict';

const sequelize = require('../config/db');
const Session = require('./Session');
const User = require('./User');

User.hasMany(Session, {
  foreignKey: 'userId',
  as: 'sessions',
  onDelete: 'CASCADE',
});
Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  sequelize,
  Session,
  User,
};
