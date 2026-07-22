'use strict';

const nodemailer = require('nodemailer');

const { env } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: env.smtp.user
    ? {
        user: env.smtp.user,
        pass: env.smtp.password,
      }
    : undefined,
});

function sendMail({ to, subject, html }) {
  if (!env.smtp.user) {
    // eslint-disable-next-line no-console
    console.log(`Email mock: ${subject} -> ${to}\n${html}`);

    return Promise.resolve();
  }

  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };
