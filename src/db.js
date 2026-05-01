import { Sequelize } from 'sequelize';

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

export const sequelize = new Sequelize({
  database: POSTGRES_DB,
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: POSTGRES_PASSWORD,
});
