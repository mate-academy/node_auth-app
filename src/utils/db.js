const { Sequelize } = require('sequelize');

const client = new Sequelize({
  host: process.env.DB_HOST || 'postgres',
  username: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});

module.exports = {
  client,
};
