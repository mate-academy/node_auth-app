require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NAME_DB,
  process.env.USER_DB,
  process.env.PASSWORD_DB,
  {
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    dialect: 'postgres',
  },
);

async function testConectionDb() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    // console.error(`error connection database`, error);
  }
}

testConectionDb();

module.exports = { sequelize };
