const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    tableName: 'users',
  },
);

const initTableUsers = () => {
  User.sync({ force: true });
};

module.exports = {
  User,
  initTableUsers,
};
