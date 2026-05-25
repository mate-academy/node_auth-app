const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
  },
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('PostgreSQL connected successfully!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Failed to connect to the PostgreSQL database.');
  }
}

testConnection();

module.exports = sequelize;
