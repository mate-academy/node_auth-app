'use strict';

const { Sequelize } = require('sequelize');

require('dotenv').config();

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

const sequelize = new Sequelize({
  database: POSTGRES_DB || 'auth_app',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: POSTGRES_PASSWORD || '123',
});

try {
  sequelize.authenticate();
} catch (error) {
  throw new Error(error);
}

module.exports = {
  sequelize,
};
