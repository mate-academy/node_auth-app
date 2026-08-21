const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    newEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    emailChangeToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
  },
);

module.exports = {
  User,
};
