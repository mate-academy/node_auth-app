const { Sequelize } = require('sequelize');

require('dotenv/config');

const { PG_DB, PG_HOST, PG_PORT, PG_USER, PG_PASS } = process.env;

const sequelize = new Sequelize({
  database: PG_DB || 'postgres',
  host: PG_HOST || 'localhost',
  port: PG_PORT || 5432,
  username: PG_USER || 'postgres',
  password: PG_PASS || '',
  dialect: 'postgres',
});

module.exports = sequelize;
