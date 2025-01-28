import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});
