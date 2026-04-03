'use strict';

const nodemailer = require('nodemailer');

function createTransport() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

const transport = createTransport();

async function sendEmail({ to, subject, text }) {
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'auth-app@example.com',
    to,
    subject,
    text,
  });

  if (info.message) {
    process.stdout.write(`Email sent: ${info.message}\n`);
  } else {
    process.stdout.write(`Email sent successfully to ${to}\n`);
  }
}

module.exports = {
  sendEmail,
};
