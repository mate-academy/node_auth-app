'use strict';

const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE_NAME } = process.env;

const sequelize = new Sequelize(
  DB_DATABASE_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  {
    host: DB_HOST,
    dialect: 'postgres',
  }
);

module.exports = {
  sequelize, DataTypes,
};
