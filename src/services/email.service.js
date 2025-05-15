require('dotenv/config');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
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

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/activation/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>`;

  return send({ email, html, subject: 'Activate' });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/reset/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>`;

  return send({ email, html, subject: 'Reset password' });
}

exports.emailService = {
  send,
  sendActivationEmail,
  sendResetEmail,
};
