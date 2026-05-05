import { Sequelize } from 'sequelize-typescript';
import 'dotenv/config';
import { User } from '../models/User';
import { Token } from '../models/Token';

export const sequelize = new Sequelize({
  database: String(process.env.DB_NAME),
  username: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  host: String(process.env.DB_HOST),
  dialect: 'postgres',
  models: [User, Token],
});
