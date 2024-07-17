import { Sequelize } from 'sequelize';
import 'dotenv/config';

const { DB_DATABASE, DB_USER, DB_HOST, DB_PASSWORD, POSTGRES_PORT } =
  process.env;

export const client = new Sequelize({
  database: DB_DATABASE || 'postgres',
  username: DB_USER || 'postgres',
  host: DB_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: DB_PASSWORD || '1',
});

client
  .authenticate()
  .then(() => console.log('Підключення до бази даних успішно встановлено.'))
  .catch((err) => console.error('Неможливо підключитися до бази даних:', err));
