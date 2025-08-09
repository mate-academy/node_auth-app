/* eslint-disable no-console */
import { pool } from './db.js';

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');

    console.log('Підключення до бази даних успішне:', res.rows[0]);
    process.exit();
  } catch (err) {
    console.error('Помилка підключення до бази:', err.message);
    process.exit(1);
  }
};

testConnection();
