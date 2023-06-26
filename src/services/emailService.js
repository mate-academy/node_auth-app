'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'AUTH API',
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationLink({ email, activationToken }) {
  const link = `${process.env.CLIENT_URL}/activate/${activationToken}`;

  return send({
    email,
    subject: 'Account Activation',
    html: `
      <h1>Account Activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendRestorePasswordLink({ email, restorePasswordToken }) {
  const link = `${process.env.CLIENT_URL}/restore/${restorePasswordToken}`;

  return send({
    email,
    subject: 'Password Restore',
    html: `
      <h1>Password Restore</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

module.exports = {
  send,
  sendActivationLink,
  sendRestorePasswordLink,
};
