'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { User } = require('./user.model.js');

const RefreshPasswordToken = sequelize.define('refreshPasswordToken', {
  refreshPasswordToken: {
    type: DataTypes.STRING,
  },
});

RefreshPasswordToken.belongsTo(User);
User.hasOne(RefreshPasswordToken);

module.exports = { RefreshPasswordToken };
