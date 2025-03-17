import Sequelize from 'sequelize';

export const client = new Sequelize({
  database: process.env.DB,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'postgres',
});
