import { pool } from '../db.js';

export const saveToken = async (userId, refreshToken) => {
  const query = `
    INSERT INTO tokens (user_id, refresh_token)
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET refresh_token = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [userId, refreshToken]);

  return result.rows[0];
};

export const findToken = async (refreshToken) => {
  const query = `SELECT * FROM tokens WHERE refresh_token = $1;`;

  const result = await pool.query(query, [refreshToken]);

  return result.rows[0];
};

export const removeToken = async (refreshToken) => {
  const query = `DELETE FROM tokens WHERE refresh_token = $1 RETURNING *;`;

  const result = await pool.query(query, [refreshToken]);

  return result.rows[0];
};
