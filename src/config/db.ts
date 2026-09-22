import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Token } from '../models/Token';

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  models: [User, Token],
});
