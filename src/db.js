'use strict';

const { Sequelize } = require('sequelize');

require('dotenv').config();

const { POSTGRES_URI } = process.env;

if (!POSTGRES_URI) {
  throw new Error('Критична помилка: POSTGRES_URI не знайдено у файлі .env');
}

const sequelize = new Sequelize(POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = {
  sequelize,
};
