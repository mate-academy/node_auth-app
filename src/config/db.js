/* eslint-disable no-console */
require('dotenv').config();

const { Sequelize } = require('sequelize');

const client = new Sequelize(
  process.env.DB_NAME, // Имя БД
  process.env.DB_USER, // Пользователь
  process.env.DB_PASS, // Пароль
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  },
);

client
  .authenticate()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch((err) => console.log('❌ PostgreSQL connection error:', err));

module.exports = {
  client,
};
