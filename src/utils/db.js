'use strict';

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const client = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    // eslint-disable-next-line no-console
    logging: (...msg) => console.log(msg),
  });

module.exports = {
  client,
};
