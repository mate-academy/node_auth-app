'use strict';

const { loadEnvFile } = require('./loadEnv');

loadEnvFile();

function toBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
}

function toNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 3000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  sessionDays: toNumber(process.env.SESSION_DAYS, 7),
  cookieSecure: toBoolean(process.env.COOKIE_SECURE),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    logging: toBoolean(process.env.DB_LOGGING),
  },
  mail: {
    from: process.env.MAIL_FROM || 'Auth App <no-reply@auth-app.local>',
    webhookUrl: process.env.MAIL_WEBHOOK_URL || '',
    webhookToken: process.env.MAIL_WEBHOOK_TOKEN || '',
  },
};
