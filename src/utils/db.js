/*eslint-disable*/
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const client = new Sequelize({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
  dialectOptions: process.env.DB_HOST?.includes('localhost')
    ? {}
    : {
        ssl: { require: true, rejectUnauthorized: false },
      },
});
