const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'node_auth_app',
  username: 'postgres',
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  password: 'postgres',
});

module.exports = {
  sequelize,
};
