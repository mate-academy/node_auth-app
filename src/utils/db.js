import { Sequelize } from "sequelize";
import 'dotenv/config';

export const client = new Sequelize({
  host: "localhost",
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: "postgres",
});
