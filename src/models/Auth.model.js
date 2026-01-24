'use strict';

const { sequelize } = require('../db.js');
const { DataTypes } = require('sequelize');
const { User } = require('./User.model.js');

const Token = sequelize.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
    timestamps: true,
    underscored: true,
  },
);

Token.belongsTo(this.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasOne(Token, { foreignKey: 'user_id' });

module.exports = {
  User,
};
