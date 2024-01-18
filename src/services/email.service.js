'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendNewEmail(email, newEmail) {
  return send({
    email,
    subject: 'Email change',
    html: `
      <h1>You'r email was successfully changed.</h1>
      <p>New email is ${newEmail}</p>
    `,
  });
}

function sendResetPassword(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-confirm/${token}`;

  return send({
    email,
    subject: 'Password reset',
    html: `
      <h1>Password reset</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

module.exports = {
  send,
  sendActivationLink,
  sendNewEmail,
  sendResetPassword,
};
