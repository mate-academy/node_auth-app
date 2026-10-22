const client = require('../utils/db.js');
const { DataTypes } = require('sequelize');
const User = require('./user.model.js');

const RefreshToken = client.define('RefreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

RefreshToken.belongsTo(User);
User.hasOne(RefreshToken);

module.exports = RefreshToken;
