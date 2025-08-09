import { pool } from '../db.js';

export const createUser = async ({ name, email, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, passwordHash],
  );

  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  return result.rows[0];
};

export const activateUser = async (email) => {
  const result = await pool.query(
    `UPDATE users SET is_active = TRUE WHERE email = $1 RETURNING *`,
    [email],
  );

  return result.rows[0];
};
