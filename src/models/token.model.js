const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');

// eslint-disable-next-line no-unused-vars
const User = require('./user.model.js');

const Token = sequelize.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);

module.exports = {
  Token,
};
