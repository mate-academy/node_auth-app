const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Reset-password</h1>
    <a href="${href}">${href}</a>
  `;

  send({ email, html, subject: 'Reset' });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  send({ email, html, subject: 'Activate' });
}

const emailService = {
  sendActivationEmail,
  sendResetPasswordEmail,
  send,
};

module.exports = { emailService, transporter, send };
