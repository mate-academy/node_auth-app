'use strict';

const nodeCrypto = require('crypto');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const rawBaseUrl = process.env.BASE_URL || `http://localhost:${port}`;

module.exports = {
  port,
  baseUrl: rawBaseUrl.replace(/\/$/, ''),
  hasSessionSecret: Boolean(process.env.SESSION_SECRET),
  sessionSecret:
    process.env.SESSION_SECRET || nodeCrypto.randomBytes(32).toString('hex'),
  sessionTtl: 7 * 24 * 60 * 60 * 1000, // 7 days
  trustProxy: Boolean(process.env.TRUST_PROXY),
  databaseUrl: process.env.DATABASE_URL || '',
  sqliteStorage:
    process.env.SQLITE_STORAGE ||
    path.join(__dirname, '..', '..', 'database.sqlite'),
  tokenTtl: {
    activation: 24 * 60 * 60 * 1000, // 24h
    reset: 60 * 60 * 1000, // 1h
  },
  mail: {
    from: process.env.MAIL_FROM || 'Auth App <no-reply@localhost>',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};
