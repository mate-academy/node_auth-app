const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');

const EmailChanges = client.define('email_changes', {
  oldEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confirmNewEmailToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

EmailChanges.belongsTo(User);
User.hasOne(EmailChanges);

module.exports = { EmailChanges };
