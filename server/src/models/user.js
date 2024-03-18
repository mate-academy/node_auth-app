const { DataTypes } = require("sequelize");
const client = require("../utils/db");

const User = client.define("auths", {
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
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
});

module.exports = User;
