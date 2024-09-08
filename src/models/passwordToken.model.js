const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');

const PasswordToken = client.define('passwordToken', {
  passwordToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

PasswordToken.belongsTo(User);
User.hasOne(PasswordToken);

module.exports = {
  PasswordToken,
};
