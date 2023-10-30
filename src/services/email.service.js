'use strict';
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

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
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

function sendRestorePassword({ email, restorePasswordCode }) {
  const href = `${process.env.CLIENT_URL}/restore/${restorePasswordCode}`;

  const html = `
  <h1>Password Restore</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Password Restore',
  });
}

function sendChangedEmail({ email }) {
  const href = `${process.env.CLIENT_URL}/login`;

  const html = `
  <h1>User Email Changed</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    ubject: 'User Email Changed',
  });
}

module.exports = {
  send,
  sendActivationEmail,
  sendRestorePassword,
  sendChangedEmail,
};
