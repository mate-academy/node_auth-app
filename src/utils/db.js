import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_NAME,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});
