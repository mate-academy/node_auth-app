'use strict';

require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: process.env.DB_DATABASE || 'postgres',
  username: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || '',
});

module.exports = {
  sequelize,
};
