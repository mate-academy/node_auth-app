'use strict';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
