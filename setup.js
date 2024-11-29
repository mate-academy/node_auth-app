const { Sequelize } = require('sequelize');
require('dotenv').config();

const client = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
  logging: false,
});

module.exports = { client };
