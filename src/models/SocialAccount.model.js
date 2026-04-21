const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils');

const SocialAccount = sequelize.define('social_account', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  providerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = SocialAccount;
