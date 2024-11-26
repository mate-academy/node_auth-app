import { Sequelize } from '@sequelize/core';

const sequelize = new Sequelize({
  dialect: 'postgres',
  database: 'auth_app',
  user: 'postgres',
  password: '1111',
  host: 'localhost',
  port: 5432,
});

try {
  await sequelize.authenticate();
  // eslint-disable-next-line no-console
  console.log('Connection has been established successfully.');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Unable to connect to the database:', error);
}

export default sequelize;
