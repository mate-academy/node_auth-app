'use strict';

const { Sequelize } = require('sequelize');

const client = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: 5432,
  dialect: 'postgres',
});

module.exports = {
  client,
};
