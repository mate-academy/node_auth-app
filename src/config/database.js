'use strict';

const { Sequelize } = require('sequelize');
const config = require('./index');

function buildSequelize() {
  if (config.databaseUrl) {
    return new Sequelize(config.databaseUrl, { logging: false });
  }

  return new Sequelize({
    dialect: 'sqlite',
    storage: config.sqliteStorage,
    logging: false,
  });
}

module.exports = buildSequelize();
