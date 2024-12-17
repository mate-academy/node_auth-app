'use strict';

const { Sequelize, DataTypes, UUIDV4 } = require('sequelize');
const yup = require('yup');

const { email } = require('../utils/validation/email.js');
const { password } = require('../utils/validation/password.js');
const { sequelize } = require('../utils/db.js');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
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
    activationToken: {
      type: DataTypes.STRING,
    },
    resetToken: {
      type: DataTypes.STRING,
      defaultValue: Sequelize.literal("NOW() + INTERVAL '30 MINUTES'"),
    },
  },
  {
    tableName: 'users',
  },
);

module.exports = {
  User,
  userSchema: yup.object().shape({
    email,
    password,
  }),
};
