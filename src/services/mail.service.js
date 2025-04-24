require('dotenv/config');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
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
  const href = `http://localhost:3005/activation/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate',
    html,
  });
}

function sendResetPassEmail(email, token) {
  const href = `http://localhost:3005/password/reset/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset password',
    html,
  });
}

function sendResetEmailEmail(email, token) {
  const href = `http://localhost:3005/profile/change-mail/${token}`;
  const html = `
  <h1>New mail</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'New mail',
    html,
  });
}

function sendWarningEmail(email) {
  const html = `
  <h1>Your mail was changed</h1>
  `;

  return send({
    email,
    subject: 'Your mail was changed',
    html,
  });
}

exports.mailService = {
  sendActivationEmail,
  sendResetPassEmail,
  sendResetEmailEmail,
  sendWarningEmail,
};
