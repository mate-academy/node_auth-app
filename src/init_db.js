import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();

    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME],
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      /* eslint-disable no-console */
      console.log(` База данных ${process.env.DB_NAME} создана!`);
    } else {
      console.log('ℹ База данных уже существует.');
    }
  } catch (err) {
    console.error(' Ошибка при создании базы:', err);
  } finally {
    await client.end();
  }
};

createDatabase();
