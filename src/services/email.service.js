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
    subject: 'Activate',
    html,
  });
};

function sendNewEmailActivation(email, token, id) {
  const href = `${process.env.CLIENT_HOST}/user/${id}/activation/${token}`;
  const html = `
  <h1>Activate new Email</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'New Email',
    html,
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/new_password/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset Password',
    html,
  });
}

function sendEmailChangeNotification(email, newEmail) {
  const html = `
  <h1>Email Change Notification</h1>
  <p>
    Your email address ${email} has been successfully changed to ${newEmail}.
  </p>
  `;

  return send({
    email,
    subject: 'Email Change',
    html,
  });
}

module.exports = {
  sendActivationEmail,
  send,
  sendResetPasswordEmail,
  sendEmailChangeNotification,
  sendNewEmailActivation,
};
