'use strict';

const { Sequelize } = require('sequelize');
// eslint-disable-next-line no-shadow
const { TextEncoder } = require('util');

// Needed for testing purposes, do not remove
require('dotenv').config();
global.TextEncoder = TextEncoder;

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

const sequelize = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: POSTGRES_PASSWORD || '123',
});

module.exports = {
  sequelize,
};
