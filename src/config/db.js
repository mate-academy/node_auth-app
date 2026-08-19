'use strict';

const { Sequelize } = require('sequelize');

const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.db.logging
    ? (message) => process.stdout.write(`${message}\n`)
    : false,
});

module.exports = { sequelize };
