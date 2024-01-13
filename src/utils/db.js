'use strict';

const Sequelize = require('sequelize');

const client = new Sequelize(
  process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

module.exports = {
  client,
};
