import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Новий пароль
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
  port: process.env.DB_PORT || 5432,
});
