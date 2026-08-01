const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const Token = client.define('Token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Token };
