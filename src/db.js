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
  database: POSTGRES_DB,
  username: POSTGRES_USER,
  host: POSTGRES_HOST,
  dialect: 'postgres',
  port: POSTGRES_PORT,
  password: POSTGRES_PASSWORD,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = {
  sequelize,
};
