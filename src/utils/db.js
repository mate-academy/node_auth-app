require('dotenv/config');

const { Sequelize } = require('sequelize');

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
  password: POSTGRES_PASSWORD || '',
  host: POSTGRES_HOST || 'localhost',
  port: POSTGRES_PORT || 5432,
  dialect: 'postgres',
  logging: false,
});

module.exports = {
  sequelize,
};
