import { Sequelize } from 'sequelize';
// import 'dotenv/config';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

export const client = new Sequelize({
  database: DB_DATABASE,
  username: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  // port: POSTGRES_PORT || 5432,
  dialect: 'postgres',
});
