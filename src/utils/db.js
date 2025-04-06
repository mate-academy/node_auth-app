import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  DB_PASSWORD,
  POSTGRES_DB,
} = process.env;

if (!DB_PASSWORD) {
  throw new Error(
    'Data Base Password is not defined | Server can not to start',
  );
}

export const sequelize = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: DB_PASSWORD,
});

sequelize.sync({ alter: true });
