'use strict';

const nodemailer = require('nodemailer');

function createEmailService(options = {}) {
  const outbox = options.outbox || [];
  let transporter = options.transporter;

  if (!transporter && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  async function send(message) {
    outbox.push(message);

    if (transporter) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'Auth App <no-reply@example.com>',
        ...message,
      });
    }
  }

  return { send, outbox };
}

module.exports = { createEmailService };
