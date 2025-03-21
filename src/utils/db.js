import { Sequelize } from 'sequelize';

export const client = new Sequelize("postgres", "postgres", "123123", {
  host: "localhost",
  dialect: "postgres",
});
