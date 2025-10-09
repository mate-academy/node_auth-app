/* eslint-disable no-console */
import { pool } from './db.js';

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');

    console.log('Conexão de banco de dados bem-sucedida:', res.rows[0]);
    process.exit();
  } catch (err) {
    console.error('Erro de conexão do banco de dados:', err.message);
    process.exit(1);
  }
};

testConnection();
