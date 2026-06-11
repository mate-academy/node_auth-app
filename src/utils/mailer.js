'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/activate/${encodeURIComponent(email)}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendPasswordResetLink(email, resetToken) {
  const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <h1>Password reset</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
}

function sendNewEmailConfirmation(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/confirm-email/${encodeURIComponent(email)}/${activationToken}`;
  const html = `
    <h1>Confirm your new email</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Confirm new email', html);
}

function sendEmailChangeNotification(email) {
  const html = `
    <h1>Your email has been changed</h1>
    <p>If you did not request this change, please contact support immediately.</p>
  `;

  return send(email, 'Email address changed', html);
}

const mailer = {
  send,
  sendActivationLink,
  sendPasswordResetLink,
  sendNewEmailConfirmation,
  sendEmailChangeNotification,
};

module.exports = { mailer };
