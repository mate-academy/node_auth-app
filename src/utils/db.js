import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  database: process.env.POSTGRES_DATABASE,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
});
