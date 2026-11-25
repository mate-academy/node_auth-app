'use strict';

const Database = require('better-sqlite3');
const { join } = require('node:path');
const { root } = require('./config');

const db = new Database(process.env.DB_PATH || join(root, 'auth.sqlite'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tokens (
    digest TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    purpose TEXT NOT NULL,
    email TEXT,
    expires INTEGER NOT NULL,
    UNIQUE (user_id, purpose)
  );

  CREATE TABLE IF NOT EXISTS outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    expires INTEGER
  );
`);

const byEmail = db.prepare('SELECT * FROM users WHERE email = ?');

const byId = db.prepare('SELECT * FROM users WHERE id = ?');

const addMail = db.prepare(`
  INSERT INTO outbox
  (recipient, subject, message, expires)
  VALUES (?, ?, ?, ?)
`);

const removeMail = db.prepare('DELETE FROM outbox WHERE id = ?');

const removeTokens = db.prepare('DELETE FROM tokens WHERE user_id = ?');

const nextMail = db.prepare(
  'SELECT * FROM outbox WHERE id > ? ORDER BY id LIMIT 1',
);

module.exports = {
  db,
  byEmail,
  byId,
  addMail,
  removeMail,
  removeTokens,
  nextMail,
};
