const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});



module.exports = {
  User,
};
