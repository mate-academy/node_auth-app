const { Sequelize } = require('sequelize');

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

const client = new Sequelize({
  database: DB_DATABASE,
  username: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  dialect: 'postgres',
});

module.exports = { client };
