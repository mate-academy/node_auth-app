const nodemailer = require('nodemailer');

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

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}"></a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
  <h1>Reset your password</h1>
  <a href="${href}"></a>
  `;

  return send({
    email,
    html,
    subject: 'Reset password',
  });
}

const emailService = {
  sendActivationEmail,
  sendPasswordResetEmail,
  send,
};

module.exports = { emailService, send };
