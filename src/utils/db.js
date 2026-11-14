import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  logging: false,
});
