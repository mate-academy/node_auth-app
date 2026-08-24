'use strict';

const nodeCrypto = require('node:crypto');
const path = require('node:path');

const isProduction = process.env.NODE_ENV === 'production';
const configuredSecret = process.env.SESSION_SECRET;

if (isProduction && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('SESSION_SECRET must contain at least 32 characters');
}

module.exports = {
  appName: 'Northstar',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  dataFile:
    process.env.DATA_FILE || path.join(process.cwd(), 'data', 'auth.json'),
  isProduction,
  port: Number(process.env.PORT) || 3000,
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'Northstar <onboarding@example.com>',
  sessionSecret: configuredSecret || nodeCrypto.randomBytes(32).toString('hex'),
};
