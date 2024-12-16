const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
};

const sendResetPasswordEmail = (email, resetToken) => {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`; // Вставляємо токен у посилання для скидання пароля
  const html = `
  <h1>Reset your password</h1>
  <p>If you requested a password reset, click the link below to reset your password:</p>
  <a href="${href}">${href}</a>
  <p>If you did not request a password reset, please ignore this email.</p>
  `;

  return send({
    email,
    html,
    subject: 'Password Reset Instructions',
  });
};

module.exports = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
};
