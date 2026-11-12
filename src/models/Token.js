const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Token = sequelize.define('Token', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = {
  Token,
};
