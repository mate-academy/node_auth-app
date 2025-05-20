'use strict';

const { Sequelize } = require('sequelize');
const utils = require('util');

require('dotenv').config();
global.TextEncoder = utils.TextEncoder;

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const sequelize = new Sequelize({
  database: DB_NAME || 'postgres',
  username: DB_USER || 'postgres',
  host: DB_HOST || 'localhost',
  dialect: 'postgres',
  port: DB_PORT || 5432,
  password: DB_PASSWORD || 'Yana2026',
});

module.exports = { sequelize };
