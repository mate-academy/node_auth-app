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
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  port: POSTGRES_PORT || '5432',
  password: POSTGRES_PASSWORD || '123123',
  dialect: 'postgres',
});

module.exports = {
  sequelize,
};
