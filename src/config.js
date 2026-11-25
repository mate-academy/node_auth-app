'use strict';

const { join } = require('node:path');

const root = join(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const baseUrl = new URL(process.env.APP_URL || 'http://localhost:' + port);
const production = process.env.NODE_ENV === 'production';
const { SESSION_SECRET, SMTP_URL, MAIL_FROM } = process.env;

if (
  production &&
  (!SESSION_SECRET || !SMTP_URL || !MAIL_FROM || baseUrl.protocol !== 'https:')
) {
  throw new Error(
    // eslint-disable-next-line max-len
    'Production requires SESSION_SECRET, SMTP_URL, MAIL_FROM and an HTTPS APP_URL.',
  );
}

module.exports = {
  root,
  port,
  baseUrl,
  SESSION_SECRET,
  SMTP_URL,
  MAIL_FROM,
};
