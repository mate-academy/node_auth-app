'use strict';

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 0,
      activation_token TEXT,
      reset_token TEXT,
      reset_expires DATETIME
    )
  `);
});

class User {
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, passwordHash, activationToken } = userData;

      db.run(
        'INSERT INTO users (name, email, password_hash, activation_token) ' +
          'VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, activationToken],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        },
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findByActivationToken(token) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE activation_token = ?',
        [token],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        },
      );
    });
  }

  static findByResetToken(token) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE reset_token = ? AND ' +
          'reset_expires > datetime("now")',
        [token],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        },
      );
    });
  }

  static update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field) => `${field} = ?`).join(', ');

      db.run(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        },
      );
    });
  }
}

module.exports = User;
