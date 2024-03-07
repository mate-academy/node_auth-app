const { Sequelize} = require('sequelize');

const client = new Sequelize({
  host: 'localhost',
  database: 'postgres',
  username: 'postgres',
  dialect: 'postgres',
  password: 'Koreathebest145!',
  port: 8080,
})

module.exports = client;
