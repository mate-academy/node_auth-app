import 'dotenv/config';
import { Sequelize } from 'sequelize';
import type { Dialect } from 'sequelize';

const { DB_DIALECT, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const sequelize = new Sequelize({
  dialect: (DB_DIALECT as Dialect) ?? 'postgres',
  host: DB_HOST ?? 'localhost',
  port: parseInt(DB_PORT ?? '5432', 10),
  username: DB_USER ?? 'postgres',
  password: DB_PASSWORD ?? '1111',
  database: DB_NAME ?? 'postgres',
  logging: false,
});

export default sequelize;
