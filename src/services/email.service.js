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

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset-confirm/${token}`;
  const html = `
    <h1>Reset Password</h1><a href="${href}">Reset your password</a>
  `;

  return send({ email, html, subject: 'Reset Password' });
}

async function sendEmailChangeNotification(oldEmail, newEmail) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: oldEmail,
    subject: 'Email Change Notification',
    text: `Your email has been changed to ${newEmail}. If this was not you, please contact support immediately.`,
  });
}

module.exports = {
  sendActivationEmail,
  send,
  sendResetEmail,
  sendEmailChangeNotification,
};
