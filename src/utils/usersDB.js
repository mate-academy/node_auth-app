const { Sequelize } = require('sequelize');

require('dotenv').config();

const { DATABASE, USERNAME, PASSWORD, HOST } = process.env;

const sequelize = new Sequelize({
  database: DATABASE,
  username: USERNAME,
  password: PASSWORD,
  host: HOST,
  dialect: 'postgres',
});

module.exports = { sequelize };
