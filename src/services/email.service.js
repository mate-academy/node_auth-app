require('dotenv').config();

const nodemailer = require('nodemailer');

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

function sendAcivationEmail(email, token) {
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
}

function sendConfirmEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;
  const html = `
    <h1>Confirm you email</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Confirm you email',
  });
}

function sendInformationEmail(email) {
  const html = `
    <h1>Your email changed</h1>
  `;

  return send({
    email,
    html,
    subject: 'Your email changed',
  });
}

function sendNewPassword(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Confirm you email</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Confirm you email',
  });
}

module.exports = {
  send,
  sendAcivationEmail,
  sendConfirmEmail,
  sendInformationEmail,
  sendNewPassword,
};
