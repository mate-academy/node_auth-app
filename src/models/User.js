const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  activationToken: {
    type: DataTypes.STRING,
  },

  resetToken: {
    type: DataTypes.STRING,
  },

  refreshToken: {
    type: DataTypes.STRING,
  },
});

module.exports = User;
