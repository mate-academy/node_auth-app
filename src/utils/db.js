const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: 'localhost',
  database: 'postgres',
  dialect: 'postgres',
  username: 'postgres',
  password: 'test1234',
  logging: false,
});

module.exports = {
  sequelize,
};
