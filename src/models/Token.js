'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { User } = require('./User');

class Token extends Model {
  static associate(model) {
    this.belongsTo(model, { foreignKey: 'userId' });
  }
}

Token.init({
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'Token',
});

Token.associate(User);

module.exports = { Token };
