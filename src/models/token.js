const { DataTypes } = require('sequelize');

const { User } = require('./user');
const { sequelize } = require('../utils/db.js');
const { getExpireTime } = require('../utils/getExpireTime.js');

const MONTH_IN_MINUTES = 30 * 24 * 60;

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
      defaultValue: getExpireTime(MONTH_IN_MINUTES),
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
