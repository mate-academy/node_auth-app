const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'node_auth_db',
  process.env.DB_USER || 'sofia',
  process.env.DB_PASSWORD || 'mypassword',
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    /* eslint-disable no-console */
    console.log('Database connection has been established successfully.');
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;
