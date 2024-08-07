'use strict';

const { Sequelize } = require('sequelize');

require('dotenv').config();

const dbClient = new Sequelize({
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  password: process.env.POSTGRES_PASSWORD || '123',
  dialect: 'postgres',
});

module.exports = {
  dbClient,
};
