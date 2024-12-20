const { Sequelize } = require('sequelize');
const { config } = require('dotenv');

config();

const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});

async function checkConnection() {
  try {
    await client.authenticate(); // перевірка з'єднання з базою даних
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkConnection();

module.exports = client;
