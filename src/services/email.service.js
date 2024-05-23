const nodemailer = require('nodemailer');

require('dotenv/config');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActinvationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate your account</h1>
  <a href = "${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
};

const sendPasswordResetEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset your password</h1>
  <a href = "${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset password' });
};

const sendNotificationEmail = (oldEmail, newEmail) => {
  const html = `
  <h1>Your email has been changed</h1>
  <p>Your email has been changed to ${newEmail}</p>
  `;

  return send({ email: oldEmail, html, subject: 'Email changed' });
};

module.exports = {
  sendActinvationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  send,
};
