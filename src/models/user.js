const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define(
  'User',
  {
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
    activationToken: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'users',
  },
);

const initUsersTable = async () => {
  await User.sync({ force: true });
};

module.exports = { User, initUsersTable };
