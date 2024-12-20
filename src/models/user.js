const { DataTypes } = require('sequelize');
const client = require('../utils/db');

const User = client.define(
  'users',
  {
    userName: {
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
    activationToken: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = {
  User,
};
