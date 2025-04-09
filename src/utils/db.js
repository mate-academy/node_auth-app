const { Sequelize } = require('sequelize');

const client = new Sequelize({
  port: process.env.PORT,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: process.env.BD_DIALECT,
});

module.exports = { client };
