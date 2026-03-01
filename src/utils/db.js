/* eslint-disable no-console */
import Sequelize from 'sequelize';
import 'dotenv/config';

const { DATABASE, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = process.env;

const sequelize = new Sequelize({
  database: DATABASE,
  username: DB_USER,
  host: DB_HOST,
  port: DB_PORT,
  password: DB_PASSWORD,
  dialect: 'postgres',
});

const checkConnection = async () => {
  try {
    await sequelize.sync({ alter: true });

    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

checkConnection();

export { sequelize };
