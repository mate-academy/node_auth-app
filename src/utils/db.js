'use strict';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  logging: false,
  dialect: 'postgres',
});

module.exports = {
  sequelize,
};
