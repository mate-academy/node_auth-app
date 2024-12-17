const { Sequelize, DataTypes } = require('sequelize');

const { User } = require('./user');
const { sequelize } = require('../utils/db.js');

const Token = sequelize.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("NOW() + INTERVAL '30 DAYS'"),
    },
  },
  {
    tableName: 'tokens',
    timestamps: false,
  },
);

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });

module.exports = { Token };
