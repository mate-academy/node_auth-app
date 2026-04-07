require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `<h1>Activate account</h1>
  <a href=${href}>${href}</a>`;

  return send({ email, html, subject: 'Activate' });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="${href}">${href}</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return send({ email, html, subject: 'Reset your password' });
}

module.exports = {
  sendActivationEmail,
  send,
  sendResetPasswordEmail,
};
