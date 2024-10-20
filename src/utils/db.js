import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
});
