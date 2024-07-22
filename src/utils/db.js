import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  host: 'localhost',
  database: 'postgres',
  dialect: 'postgres',
  username: 'postgres',
  password: 'test1234',
  logging: false,
});
