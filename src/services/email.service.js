'use strict';

require('dotenv/config');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>AA</h1>
  <a href=${href}>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendResetMail(email, resetToken) {
  const link = `${process.env.CLIENT_URL}/reset/${resetToken}`;

  return send({
    email,
    subject: 'Reset password',
    html: `
    <p>Follow the link below to reset your password </p>
    <a href=${link}>${link}</a>
    `,
  });
};

function sendChangeMail(email) {
  return send({
    email,
    subject: 'Email removed',
    html: `
      <h1>This email was removed from app</h1>
    `,
  });
};

module.exports = {
  send,
  sendActivationEmail,
  sendResetMail,
  sendChangeMail,
};
