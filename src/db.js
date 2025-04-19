import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  database: 'postgres',
  username: 'postgres',
  host: 'localhost',
  dialect: 'postgres',
  password: 'qwpogh1209',
});
