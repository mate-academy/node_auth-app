'use strict';

const { DataTypes } = require('sequelize');

const { DatabaseTableNames, sequelize } = require('../libs/db/database.js');
const { getHash } = require('../libs/helpers/helpers.js');
const { UserRoles } = require('../libs/enums/enums.js');

const User = sequelize.define(DatabaseTableNames.USER, {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(UserRoles.USER, UserRoles.ADMIN),
    allowNull: false,
    defaultValue: UserRoles.USER,
  },
}, {
  hooks: {
    beforeSave: async(user) => {
      if (user.password) {
        user.password = await getHash(user.password);
      }
    },
  },
});

module.exports = {
  User,
};
